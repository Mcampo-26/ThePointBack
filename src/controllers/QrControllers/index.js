
import Qr from '../../models/Qr.js';

import axios from 'axios';
import { MERCADOPAGO_API_KEY } from '../../config/index.js';




// Crear QR
export const createQr = async (req, res) => {
  try {
    const {
    
      nombre,
      isPayment, 
      precio,
      
    } = req.body;

    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const newQr = new Qr({
     
      nombre,
      precio
 
    });

    await newQr.save();

    // Generar enlace de pago solo si es un QR de pago directo
    if (isPayment) {
      const paymentLinkResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', {
        items: [{
          title: nombre,
          unit_price: parseFloat(precio),
          quantity: 1,
          currency_id: 'ARS',
        }],
        back_urls: {
          success: 'https://thepoint.netlify.app/payment-result/success',
          failure: 'https://thepoint.netlify.app/payment-result/failure',
          pending: 'https://thepoint.netlify.app/payment-result/pending'
        },
        auto_return: 'approved',
      }, {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_API_KEY}`
        }
      });

      const paymentLink = paymentLinkResponse.data.init_point;

      // Actualizar QR solo con el enlace de pago
      newQr.paymentLink = paymentLink;
      await newQr.save();
    }

    res.status(201).json({
      message: "QR creado exitosamente",
      newQr: {
        _id: newQr._id,
        paymentLink: newQr.paymentLink // Devolver solo el enlace de pago si existe
      }
    });
  } catch (error) {
    console.error("Error en createQr:", error);
    res.status(500).json({ message: "Error al crear el QR", error: error.message });
  }
};

//