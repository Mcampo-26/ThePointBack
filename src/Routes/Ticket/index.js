import express from "express";
import { getTicket, saveTicket} from "../../controllers/ticketControllers/index.js";

const router = express.Router();

// 📌 Ruta para obtener la configuración del ticket
router.get("/get", getTicket);

// 📌 Ruta para guardar o actualizar la configuración del ticket
router.post("/guardar", saveTicket);

export default router;
