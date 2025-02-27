import Venta from "../../models/Ventas.js"; // Importamos el modelo de ventas
import axios from "axios";

// Función para almacenar ventas después de un pago exitoso
export const saveVenta = async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "Falta el ID del pago." });
  }

  try {
    // 🔹 Consultamos los detalles del pago en Mercado Pago
    const paymentDetails = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
        },
      }
    );

    const paymentData = paymentDetails.data;

    // Verificamos si el pago fue aprobado
    if (paymentData.status !== "approved") {
      return res.status(400).json({ message: "El pago no está aprobado." });
    }

    // 🔹 Extraemos la información relevante para la venta
    const ventaData = {
      transactionId: paymentData.id, // ID de la transacción en Mercado Pago
      totalAmount: paymentData.transaction_amount, // Monto total pagado
      status: paymentData.status, // Estado del pago: approved, rejected, pending
      fechaVenta: new Date(paymentData.date_approved || paymentData.date_created), // Fecha de la venta

      // Extraemos los productos comprados
      items: paymentData.additional_info?.items?.map((item) => ({
        productId: item.id || null, // ID del producto si lo tenemos
        name: item.title, // Nombre del producto
        price: item.unit_price, // Precio unitario
        quantity: item.quantity, // Cantidad comprada
      })) || [],
    };

    // 🔹 Guardamos la venta en la base de datos
    const nuevaVenta = new Venta(ventaData);
    await nuevaVenta.save();

    res.status(201).json({ message: "Venta guardada exitosamente.", venta: nuevaVenta });
  } catch (error) {
    console.error("Error al guardar la venta:", error);
    res.status(500).json({ message: "Error al guardar la venta.", error: error.message });
  }
};

// Obtener todas las ventas o filtrar por fecha
export const getVentas = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.fechaVenta = {
        $gte: new Date(startDate), // Fecha de inicio
        $lte: new Date(endDate),   // Fecha de fin
      };
    }

    const ventas = await Venta.find(query).sort({ fechaVenta: -1 }).populate("items.productId");

    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas." });
  }
};

// Obtener una venta por ID
export const getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate("items.productId");

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ message: "Error al obtener venta." });
  }
};


export const obtenerVentasMercadoPago = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.mercadopago.com/v1/payments/search",
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`, // 🔹 Usa tu Access Token desde variables de entorno
        },
      }
    );

    res.status(200).json(response.data.results); // Enviar ventas al frontend
  } catch (error) {
    console.error("Error al obtener ventas de Mercado Pago:", error);
    res.status(500).json({ message: "Error al obtener ventas", error: error.message });
  }
};
