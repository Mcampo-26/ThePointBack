import Ventas from "../../models/Ventas.js";

// 📌 Obtener los productos más vendidos con filtro de fecha
export const getTopProductos = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        let filter = {};

        if (startDate && endDate) {
            filter.fechaVenta = { 
                $gte: new Date(`${startDate}T00:00:00.000Z`), 
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }

        console.log("📅 FILTRO DE FECHAS:", filter.fechaVenta); // 🔥 Verifica qué se está filtrando

        // 🔹 Obtener productos más vendidos en el rango de fecha
        const topProductos = await Ventas.aggregate([
            { $match: filter },
            { $unwind: "$items" }, // 🔥 Desglosar productos dentro de cada venta
            { 
                $group: { 
                    _id: "$items.productId", 
                    nombre: { $first: "$items.name" },
                    precio: { $first: "$items.price" }, // Asegurar que el precio está presente
                    totalVendido: { $sum: "$items.quantity" },
                    totalIngresos: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalVendido: -1 } },
            { $limit: 10 }
        ]);

        console.log("🔹 PRODUCTOS ENVIADOS:", topProductos);

        res.json(topProductos);
    } catch (error) {
        console.error("❌ Error al obtener los productos más vendidos:", error);
        res.status(500).json({ message: "Error al obtener reportes" });
    }
};
