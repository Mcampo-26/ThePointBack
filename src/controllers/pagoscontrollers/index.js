import axios from 'axios';
import { MERCADOPAGO_API_KEY } from '../../Config/index.js';




export const createDynamicQR = async (req, res) => {
  const { title, price, products, socketId } = req.body;
   console.log('Datos recibidos en el backend:', { title, price, products, socketId });// Recibir socketId del frontend

  // Verificación de datos
  if (!title || !price || isNaN(price) || !products || products.length === 0 || !socketId) {
    return res.status(400).json({ message: 'Datos inválidos: título, precio, productos o socketId no válidos' });
  }

  // Datos para la solicitud a la API de POS para generar el QR dinámico
  const qrData = {
    external_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Identificador único para la transacción
    name: title,
    fixed_amount: true,
    category: "general",
    price: parseFloat(price),
    currency_id: 'ARS',
  };

  try {
    // Hacer la solicitud a la API de Mercado Pago para generar el QR dinámico
    const response = await axios.post('https://api.mercadopago.com/pos/', qrData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_API_KEY}`,
      }
    });

    const qrCode = response.data.qr_code;

    // Guardar el external_id y el socketId en la base de datos
    await Payment.create({
      external_reference: qrData.external_id,
      socketId, // Asociar el socketId al QR
      status: 'pending',
    });

    // Devolver la URL del código QR al frontend
    res.json({ qrCodeURL: qrCode });
  } catch (error) {
    console.error('Error al crear el QR dinámico:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error al crear el QR dinámico', error: error.message });
  }
};







// Método para y generar el QR con el enlace directo
import { MERCADOPAGO_API_KEY } from '../../Config/index.js';
import axios from 'axios';

export const createPaymentLink = async (req, res) => {
  const { title, price, socketId } = req.body;

  // Verificación de datos
  if (!title || !price || isNaN(price) || !socketId) {
    return res.status(400).json({ message: 'Datos inválidos: título, precio o socketId no válidos' });
  }

  // Datos de la preferencia para Mercado Pago
  const preferenceData = {
    items: [
      {
        title, // Título genérico
        unit_price: parseFloat(price), // Precio total
        quantity: 1, // Una sola compra
        currency_id: 'ARS',
      }
    ],
    payer: {
      email: 'test_user_123456@test.com', // Cambiar por el correo del usuario
    },
    back_urls: {
      success: "https://www.mercadopago.com.ar",
      failure: "https://www.mercadopago.com.ar",
      pending: "https://www.mercadopago.com.ar",
    },
    notification_url: `${process.env.BACKEND_URL}/Pagos/webhook`,
    auto_return: 'approved',
    external_reference: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    expires: true, // Habilitar la expiración
    external_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Expira en 50 segundos // Genera una referencia única para cada transacción
  };

  console.log('URL de éxito:', `${process.env.URL.trim()}/payment-result/success`);

  try {
    // Hacer solicitud a la API de Mercado Pago
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_API_KEY}`,
      }
    });

    const paymentLink = response.data.init_point; // Enlace de pago web

    // Almacenar el socketId junto con la transacción en tu base de datos
    await Payment.create({
      external_reference: preferenceData.external_reference,
      socketId, // Asociar el socketId a la transacción
      status: 'pending',
    });

    // Generar deep link para abrir directamente en la app de Mercado Pago
    const deepLink = paymentLink.replace('https://www.mercadopago.com/', 'mercadopago://');

    // Devolver el deep link al frontend
    res.json({ paymentLink: deepLink });
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      message: 'Error al crear la preferencia de pago', 
      error: error.message,
    });
  }
};



const validateQRBeforePayment = async (req, res, next) => {
  const { qrId } = req.body;

  try {
    // Busca el QR por su ID
    const qr = await Qr.findById(qrId);

    if (!qr) {
      return res.status(404).json({ message: 'QR no encontrado' });
    }

    // Verifica si ya tiene una transacción completada o en progreso
    const existingTransaction = qr.transactions.find(
      (transaction) => transaction.status === 'completed' || transaction.status === 'pending'
    );

    if (existingTransaction) {
      return res.status(400).json({ message: 'Este QR ya ha sido usado o tiene un pago pendiente' });
    }

    // Si no hay transacción pendiente o completada, continúa con el pago
    next();
  } catch (error) {
    console.error('Error validando el QR:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
const updateQrStatusAfterPayment = async (paymentId, status) => {
  try {
    // Encuentra el QR asociado y actualiza su estado
    const qr = await Qr.findById(paymentId); // Asegúrate de que `paymentId` esté bien asociado

    if (qr) {
      qr.status = status === 'approved' ? 'used' : 'rejected';
      await qr.save();
    }
  } catch (error) {
    console.error('Error actualizando el estado del QR:', error);
  }
};
