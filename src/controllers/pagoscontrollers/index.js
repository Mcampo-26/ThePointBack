import axios from 'axios';
import Venta from '../../models/Ventas.js';  //  <-- Asegúrate de importar tu modelo

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
      sku_number: item.sku || `SKU_${item.name}`, 
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

    console.log("Respuesta de Mercado Pago:", response.data);

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

// 1️⃣ Función interna para guardar la venta en DB
async function guardarVentaInterno(paymentData) {
  if (!paymentData) throw new Error("No hay datos de pago");

  // Solo guardamos si está aprobado
  if (paymentData.status !== "approved") return;

  const ventaData = {
    transactionId: paymentData.id,
    totalAmount: paymentData.transaction_amount,
    status: paymentData.status,
    fechaVenta: new Date(paymentData.date_approved || paymentData.date_created),
    items:
      paymentData.additional_info?.items?.map((item) => ({
        productId: item.id || null,
        name: item.title,
        price: item.unit_price,
        quantity: item.quantity,
      })) || [],
  };

  // Creamos y guardamos la venta en Mongo
  const nuevaVenta = new Venta(ventaData);
  await nuevaVenta.save();

  console.log("Venta guardada en DB con ID:", nuevaVenta._id);
}

// 2️⃣ Webhook de Mercado Pago
export const receiveWebhook = async (req, res) => {
  const io = req.app.locals.io; 
  const { type, data } = req.body;

  if (type === "payment") {
    const paymentId = data.id;

    try {
      // Consulta los detalles del pago
      const paymentDetails = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
          },
        }
      );

      const paymentData = paymentDetails.data;

      if (paymentData.status === "approved") {
        await guardarVentaInterno(paymentData);

        // Luego emites el evento de éxito (Socket.IO)
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
      console.error("Error procesando webhook:", error);
      return res.status(500).json({
        message: "Error al procesar webhook",
        error: error.message,
      });
    }
  } else {
    // Si el tipo no es payment, responde OK
    return res.sendStatus(200);
  }
};
