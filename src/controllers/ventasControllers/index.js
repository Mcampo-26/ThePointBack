import Venta from "../../models/Ventas.js"; // Importamos el modelo de ventas
import axios from "axios";

// Función para almacenar ventas después de un pago exitoso

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

export const guardarVentaManual = async (req, res) => {
  try {
    const { pagador, emailPagador, transactionId, totalAmount, status, items } = req.body;

    // Validación de datos obligatorios
    if (!transactionId || !totalAmount || !status || !items) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const nuevaVenta = new Venta({
      pagador: pagador || "Desconocido",
      emailPagador: emailPagador || "No disponible",
      transactionId,
      totalAmount,
      status,
      fechaVenta: new Date(),
      items: items.map((item) => ({
        productId: item.productId || null, // Opcional, en caso de que no tengas ID del producto
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    await nuevaVenta.save();
    res.status(201).json({ message: "Venta guardada con éxito.", venta: nuevaVenta });
  } catch (error) {
    console.error("❌ Error guardando la venta manual:", error);
    res.status(500).json({ message: "Error al guardar la venta." });
  }
};