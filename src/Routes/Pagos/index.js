import express from "express";
import {
  createInteroperableQR, // Importa el nuevo controlador
  //createPaymentLink,
  savePaymentDetails,
  receiveWebhook,
} from "../../controllers/pagoscontrollers/index.js";

const router = express.Router();

// Ruta para crear el QR interoperable
router.put('/create_interoperable_qr', createInteroperableQR);

// Ruta para crear el enlace de pago (puedes mantenerlo si lo usas para otro propósito)
//router.post('/create_payment_link', createPaymentLink);

// Ruta para guardar los detalles del pago
router.post('/save_payment_details', savePaymentDetails);

// Ruta para recibir los webhooks de Mercado Pago
router.post('/webhook', receiveWebhook);

export default router;
