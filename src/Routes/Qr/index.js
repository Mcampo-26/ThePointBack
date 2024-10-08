import express from 'express';
import {
  createQr,               // Controlador para crear un nuevo QR
  validateQrBeforePayment, // Controlador para validar el QR antes del pago
  updateQrStatusAfterPayment // Controlador para actualizar el estado del QR
} from '../../controllers/QrControllers/index.js'; // Asegúrate de que la ruta al controlador sea correcta

const router = express.Router();

// Ruta para crear un nuevo QR
router.post('/create_qr', createQr);

// Ruta para validar si el QR es válido antes de proceder con el pago
router.post('/validate_qr', validateQrBeforePayment);

// Ruta para actualizar el estado del QR después de realizar el pago
router.post('/update_qr_status', updateQrStatusAfterPayment);

export default router;
