import express from "express";
import {
  createPaymentLink,
  savePaymentDetails,
  receiveWebhook,
} from "../../controllers/pagoscontrollers/index.js";
//import validateQRBeforePayment from "../../middleware/validateQRBeforePayment.js"; // Importa el middleware de validación de QR

const router = express.Router();

// Ruta para crear el enlace de pago con la validación del QR antes del pago
router.post('/create_payment_link', createPaymentLink);

// Ruta para guardar los detalles del pago
router.post('/save_payment_details', savePaymentDetails);

// Ruta para recibir los webhooks de Mercado Pago
router.post('/webhook', receiveWebhook);

export default router;
