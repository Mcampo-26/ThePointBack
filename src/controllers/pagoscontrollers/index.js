import axios from 'axios';
import { MERCADOPAGO_API_KEY } from '../../Config/index.js';
import Venta from "../../models/Venta.js"; 


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

const guardarVentaInterno = async (paymentData) => {
  try {
    console.log("📌 Guardando venta en la base de datos:", paymentData);

    // Crear nueva venta en la base de datos
    const nuevaVenta = new Venta({
      items: paymentData.additional_info?.items?.map((item) => ({
        productId: item.sku_number, // Si en tu DB usas ObjectId, necesitarás manejarlo diferente
        name: item.title,
        price: item.unit_price,
        quantity: item.quantity,
      })) || [],
      totalAmount: paymentData.transaction_amount,
      status: paymentData.status,
      transactionId: paymentData.id, // ID de la transacción en Mercado Pago
    });

    // Guardar en la base de datos
    await nuevaVenta.save();
    console.log("✅ Venta guardada con éxito en la base de datos");

  } catch (error) {
    console.error("❌ Error guardando la venta en la base de datos:", error);
    throw error;
  }
};


export const receiveWebhook = async (req, res) => {
  const io = req.app.locals.io;
  const { type, data } = req.body;

  console.log("🔹 Webhook recibido:", req.body);

  if (type === "payment") {
    const paymentId = data.id;
    console.log(`🔹 Procesando pago con ID: ${paymentId}`);

    try {
      const paymentDetails = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` } }
      );

      const paymentData = paymentDetails.data;
      console.log("🔹 Datos del pago obtenidos:", paymentData);

      if (paymentData.status === "approved") {
        await guardarVentaInterno(paymentData); // 🔹 Llamamos a la función para guardar la venta en la DB
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




