import express from "express";
import {
  createPaymentLink,
  savePaymentDetails,
  receiveWebhook,
} from "../../controllers/pagoscontrollers/index.js";


const router = express.Router();

router.post('/create_payment_link', createPaymentLink);
router.post('/save_payment_details', savePaymentDetails);
router.post('/webhook', receiveWebhook);  // Ajusta la ruta para el webhook


export default router;
