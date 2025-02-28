import express from "express";
import { getVentas, getVentaById, guardarVentaManual } from "../../controllers/ventasControllers/index.js";

const router = express.Router();

// Obtener todas las ventas o filtrar por fecha
router.get("/", getVentas);

// Obtener una venta por su ID
router.get("/:id", getVentaById);

// 📌 Nueva ruta para guardar una venta ficticia (para pruebas)
router.post("/guardar", guardarVentaManual);

export default router;
