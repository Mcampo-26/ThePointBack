import axios from 'axios';
import { MERCADOPAGO_API_KEY } from '../../Config/index.js';




// Método para guardar los detalles de pago y generar el QR con el enlace directo
export const createPaymentLink = async (req, res) => {
  const { title, price } = req.body;

  // Verificación de datos
  if (!title || !price || isNaN(price)) {
    return res.status(400).json({ message: 'Datos inválidos: título o precio no válidos' });
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
      success: `${process.env.URL.trim()}/payment-result/success`, // Asegúrate de tener la URL correcta en tu entorno
      failure: `${process.env.URL.trim()}/payment-result/failure`,
      pending: `${process.env.URL.trim()}/payment-result/pending`,
    },
    notification_url: `${process.env.BACKEND_URL}/Pagos/webhook`,
    auto_return: 'approved', // Configura el retorno automático cuando el pago sea aprobado
  };

  console.log('URL de éxito:', `${process.env.URL.trim()}/payment-result/success`);

  try {
    // Hacer solicitud a la API de Mercado Pago
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_API_KEY}`, // Asegúrate de tener la clave correcta
      }
    });

    const paymentLink = response.data.init_point; // Enlace de pago

    // Devolver el enlace de pago al frontend
    res.json({ paymentLink });
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      message: 'Error al crear la preferencia de pago', 
      error: error.message,
    });
  }
};


export const savePaymentDetails = async (req, res) => {
  const { userId, amount,  items } = req.body;

  if (!userId) {
    console.error('El ID de usuario es nulo o indefinido.');
    return res.status(400).json({ message: 'ID de usuario es requerido' });
  }

  console.log('Buscando usuario con ID:', userId);

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      console.log('Usuario no encontrado para ID:', userId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', usuario);

    usuario.paymentDetails = {
     
      amount,    

      items,  // Asegúrate de que los ítems se están guardando aquí
    };

    await usuario.save();
    res.status(200).json({ message: 'Detalles de pago guardados exitosamente' });
  } catch (error) {
    console.error('Error al guardar los detalles del pago:', error);
    res.status(500).json({ message: 'Error al guardar los detalles del pago' });
  }
};



export const receiveWebhook = async (req, res) => {
  const io = req.app.locals.io; // Obtener el objeto `io` desde `app.locals`

  if (!io) {
    console.error('Error: io no está definido en el contexto del servidor');
    return res.status(500).json({ message: 'Error: io no está definido' });
  }

  console.log('Webhook recibido:', req.body);

  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      console.log('ID del pago recibido:', paymentId);

      // Obtener detalles del pago desde Mercado Pago
      const paymentDetails = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_API_KEY}`,
        },
      });

      // Verificar si el pago fue aprobado
      if (paymentDetails.data.status === 'approved') {
        console.log('Pago aprobado:', paymentDetails.data);

        // Emitir un evento a través de WebSockets a todos los clientes conectados
        io.emit('paymentSuccess', {
          status: 'approved',
          paymentId: paymentDetails.data.id,
          amount: paymentDetails.data.transaction_amount, // Puedes enviar más detalles si es necesario
        });
      }

      // Responder a Mercado Pago que el webhook fue procesado correctamente
      res.sendStatus(200);
    } else {
      console.log('Tipo de evento desconocido:', type);
      res.sendStatus(200); // Responde 200 incluso si el tipo de evento no es "payment"
    }
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    res.status(500).json({ message: 'Error al procesar el webhook' });
  }
};






