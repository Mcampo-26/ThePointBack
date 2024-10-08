import express from "express";
import {
  createModoCheckout,
  receiveModoWebhook,
} from "../../Pagos/Modo/index.js"; // Importa los controladores de MODO

const router = express.Router();

// Ruta para crear el checkout de MODO
router.post('/create_modo_checkout', createModoCheckout);

// Ruta para recibir el webhook de MODO
router.post('/modo_webhook', receiveModoWebhook); // Ruta para procesar el webhook

export default router;
