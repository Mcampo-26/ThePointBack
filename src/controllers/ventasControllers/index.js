import Venta from "../../models/Ventas.js"; // Importamos el modelo de ventas
import axios from "axios";

// Función para almacenar ventas después de un pago exitoso

// Obtener todas las ventas o filtrar por fecha
export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fechaVenta: -1 }).populate("items.productId");
    console.log("📌 Ventas obtenidas sin filtro:", ventas.length); // 🔍 Revisa si devuelve datos
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
