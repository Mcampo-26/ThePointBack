import express from "express";
import {getVentas, getVentaById} from "../../controllers/ventasControllers/index.js";

const router = express.Router();

// Guardar venta después de un pago exitoso


// Obtener todas las ventas o filtrar por fecha
router.get("/ventas", getVentas);

// Obtener una venta por su ID
router.get("/:id", getVentaById);

export default router;
