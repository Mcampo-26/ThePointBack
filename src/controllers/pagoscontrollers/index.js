import axios from 'axios';
import Venta from "../../models/Ventas.js"; 


export const createInteroperableQR = async (req, res) => {
  const { title, items, totalAmount } = req.body;

  console.log("Request recibido:", { title, items, totalAmount });

  // Validación de datos requeridos
  if (!title || !items || !totalAmount) {
    console.error("Datos incompletos:", { title, items, totalAmount });
    return res.status(400).json({ message: "Datos incompletos." });
  }

  // Construcción de los datos de la orden
  const orderData = {
    external_reference: `ORDER_${Date.now()}`,
    title,
    description: "Compra realizada en la tienda",
    notification_url: "https://thepointback-03939a97aeeb.herokuapp.com/Pagos/webhook",
    total_amount: totalAmount,
    items: items.map((item) => ({
      sku_number: item.sku || `SKU_${item.name}`, // SKU dinámico si no está definido
      category: item.category || "marketplace",
      title: item.name,
      description: item.description || "Producto sin descripción",
      unit_price: item.price,
      quantity: item.quantity,
      unit_measure: "unit",
      total_amount: item.price * item.quantity,
    })),
    cash_out: { amount: 0 },
  };

  console.log("Datos preparados para la orden:", orderData);

  try {
    console.log("Enviando solicitud a Mercado Pago...");

    // Endpoint configurado dinámicamente
    const response = await axios.put(
      `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${process.env.COLLECTOR_ID}/pos/${process.env.EXTERNAL_POS_ID}/qrs`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Respuesta de Mercado Pago:", response);

    // Enviar respuesta al frontend
    res.status(200).json({
      message: "Orden asociada correctamente.",
      qr_data: response.data.qr_data,
      order_id: response.data.in_store_order_id,
    });
  } catch (error) {
    console.error("Error al asociar la orden:");
    if (error.response) {
      console.error("Estado:", error.response.status);
      console.error("Datos de respuesta:", error.response.data);
    } else {
      console.error("Mensaje de error:", error.message);
    }
    res.status(500).json({
      message: "Error al asociar la orden.",
      error: error.response?.data || error.message,
    });
  }
};

const obtenerDatosPagador = async (payerId) => {
  try {
    // Intentar obtener información desde la API de Customers
    const customerResponse = await axios.get(
      `https://api.mercadopago.com/v1/customers/${payerId}`,
      {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      }
    );

    console.log("✅ Datos del pagador obtenidos desde /customers:", customerResponse.data);
    return {
      payerId,
      email: customerResponse.data.email || "No disponible",
      nombreBilletera: "No disponible", // No se obtiene desde customers
      metodoPago: "No disponible",
    };
  } catch (error) {
    console.warn("⚠️ Cliente no encontrado en /customers, buscando en /payments...");

    // Si no se encuentra en customers, intentamos obtener los datos desde el pago
    try {
      const paymentResponse = await axios.get(
        `https://api.mercadopago.com/v1/payments/${payerId}`, // Aquí pasamos el paymentId
        {
          headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
        }
      );

      const paymentData = paymentResponse.data;

      const pagador = {
        payerId: paymentData.payer?.id || "Desconocido",
        email: paymentData.payer?.email || "No disponible",
        nombreBilletera:
          paymentData.point_of_interaction?.transaction_data?.bank_info?.payer?.long_name || "Desconocido",
        metodoPago: paymentData.payment_method?.id || "Desconocido",
      };

      console.log("✅ Datos del pagador obtenidos desde /payments:", pagador);
      return pagador;
    } catch (error) {
      console.error("❌ Error al obtener datos del pagador:", error.response?.data || error.message);
      return null;
    }
  }
};

const guardarVentaInterno = async (paymentData) => {
  try {
    if (!paymentData) {
      console.error("❌ Error: paymentData no está definido.");
      return;
    }

    console.log("📌 Guardando venta en la base de datos:", paymentData);

    // ✅ Obtener el nombre de la billetera utilizada
    const nombreBilletera = obtenerNombreBilletera(paymentData.payment_method?.id);

    let pagadorEmail = paymentData.payer?.email || "No disponible";

    const nuevaVenta = new Venta({
      pagador: nombreBilletera, // Aquí guardamos la billetera en lugar del nombre del pagador
      emailPagador: pagadorEmail,
      transactionId: paymentData.id,
      totalAmount: paymentData.transaction_amount,
      status: paymentData.status,
      fechaVenta: new Date(paymentData.date_approved || Date.now()),
      items: paymentData.additional_info?.items?.map((item) => ({
        productId: item.sku_number,
        name: item.title,
        price: item.unit_price,
        quantity: item.quantity,
      })) || [],
    });

    await nuevaVenta.save();
    console.log("✅ Venta guardada con éxito en la base de datos");
  } catch (error) {
    console.error("❌ Error guardando la venta en la base de datos:", error);
    throw error;
  }
};

// 🔹 Mapeo de billeteras según el método de pago
const obtenerNombreBilletera = (paymentMethodId) => {
  const billeteras = {
    "account_money": "Mercado Pago",
    "visa": "Visa",
    "master": "Mastercard",
    "amex": "American Express",
    "debvisa": "Visa Débito",
    "debin_transfer": "Transferencia Bancaria",
    "wallet_uala": "Ualá",
    "wallet_naranja": "Naranja X",
    "wallet_brubank": "Brubank",
    "wallet_bna": "BNA+",
    "wallet_modo": "MODO",
  };

  return billeteras[paymentMethodId] || "Método Desconocido";
};



export const receiveWebhook = async (req, res) => {
  const io = req.app.locals.io;
  const { type, data } = req.body;

  console.log("🔹 Webhook recibido:", req.body);

  if (type === "payment") {
    const paymentId = data.id;
    console.log(`🔹 Procesando pago con ID: ${paymentId}`);

    try {
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` } }
      );

      const paymentData = response.data; // 🔹 Definimos correctamente paymentData
      console.log("🔹 Datos del pago obtenidos:", paymentData);

      if (paymentData.status === "approved") {
        await guardarVentaInterno(paymentData); // 🔹 Pasamos paymentData correctamente
        console.log("✅ Venta guardada con éxito");

        io.emit("paymentSuccess", {
          status: "approved",
          paymentId,
          amount: paymentData.transaction_amount,
        });
      } else if (paymentData.status === "rejected") {
        io.emit("paymentFailed", { status: "rejected", paymentId });
      } else {
        io.emit("paymentPending", { status: "pending", paymentId });
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("❌ Error procesando webhook:", error);
      return res.status(500).json({ message: "Error al procesar webhook", error: error.message });
    }
  } else {
    return res.sendStatus(200);
  }
};


