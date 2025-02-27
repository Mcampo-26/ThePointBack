import express from "express";
import {
  createInteroperableQR,
  receiveWebhook,
} from "../../controllers/pagoscontrollers/index.js";

const router = express.Router();

// Crear el QR interoperable
router.put('/create_interoperable_qr', createInteroperableQR);

// Webhook de Mercado Pago
router.post('/webhook', receiveWebhook);

export default router;
