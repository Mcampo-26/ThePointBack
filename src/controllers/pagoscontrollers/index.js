import axios from 'axios';
import { MERCADOPAGO_API_KEY, MODO_TOKEN} from '../../Config/index.js';






// Método para y generar el QR con el enlace directo
export const createPaymentLink = async (req, res) => {
  const { title, price,socketId  } = req.body;

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
        'Authorization': `Bearer ${MERCADOPAGO_API_KEY}`, // Asegúrate de tener la clave correcta
      }
    });

    const paymentLink = response.data.init_point; // Enlace de pago web

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
  const io = req.app.locals.io;

  if (!io) {
    console.error('Error: io no está definido en el contexto del servidor');
    return res.status(500).json({ message: 'Error: io no está definido' });
  }

  console.log('Webhook recibido:', req.body);

  try {
    const { topic, resource, data, status, socketId } = req.body;

    if (topic === 'merchant_order') {
      // Manejo del topic 'merchant_order'
      try {
        const orderResponse = await axios.get(resource, {
          headers: { Authorization: `Bearer ${MERCADOPAGO_API_KEY}` },
        });

        const paymentStatus = orderResponse.data.payments[0]?.status;
        const paymentId = orderResponse.data.payments[0]?.id;
        console.log('Detalles de la orden:', orderResponse.data);

        if (!paymentId) {
          console.error('ID de pago no encontrado en los datos de la orden');
          return res.status(400).json({ message: 'ID de pago no encontrado' });
        }

        // Emitir el evento basado en el estado de pago
        if (paymentStatus === 'approved') {
          console.log('Pago aprobado:', paymentId);
          io.to(socketId).emit('paymentSuccess', { status: 'approved', paymentId });
        } else if (paymentStatus === 'rejected') {
          console.log('Pago rechazado:', paymentId);
          io.to(socketId).emit('paymentFailed', { status: 'rejected', paymentId });
        } else {
          console.log('Estado de pago desconocido:', paymentStatus);
        }

        return res.sendStatus(200);
      } catch (error) {
        console.error('Error al obtener detalles de la orden:', error.message);
        return res.status(500).json({ message: 'Error al procesar el merchant_order' });
      }
    } else if (topic === 'payment') {
      // Lógica para el topic 'payment' (como antes)
      const paymentId = data?.id;
      if (!paymentId) {
        console.error('ID de pago no encontrado en los datos recibidos');
        return res.status(400).json({ message: 'ID de pago no encontrado' });
      }

      if (status === 'approved') {
        console.log('Pago aprobado:', paymentId);
        io.to(socketId).emit('paymentSuccess', { status, paymentId });
      } else if (status === 'rejected') {
        console.log('Pago rechazado:', paymentId);
        io.to(socketId).emit('paymentFailed', { status, paymentId });
      } else {
        console.log('Estado de pago desconocido:', status);
      }

      res.sendStatus(200);
    } else {
      console.log('Tipo de evento desconocido:', topic);
      res.sendStatus(200); // Responder con éxito aunque el tipo sea desconocido
    }
  } catch (error) {
    console.error('Error procesando el webhook:', error.message || error);
    res.status(500).json({ message: 'Error al procesar el webhook' });
  }
};




export const createModoCheckout = async (req, res) => {
  const { price, details, socketId } = req.body;
  console.log("Socket ID recibido en el backend:", socketId);

  if (!details || details.length === 0 || !socketId) {
    return res.status(400).json({ message: 'Faltan los detalles de los productos o el socketId' });
  }

  // Generar un `externalIntentionId` único
  const externalIntentionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log('Generado externalIntentionId:', externalIntentionId);

  // Crear y guardar la transacción en MongoDB

  try {
    const modoURL = 'https://merchants.playdigital.com.ar/merchants/ecommerce/payment-intention';
    const storeId = 'b56f4d39-afed-47e5-84c4-664b96668915';
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const response = await axios.post(modoURL, {
      productName: details[0].productName,
      price: price,
      quantity: details[0].quantity,
      currency: 'ARS',
      storeId,
      externalIntentionId, // Usa el ID generado
      expirationDate,
      socketId, // Enviar el socketId en la petición
      message: socketId,},
      
      {
      headers: {
        'Authorization': `Bearer ${MODO_TOKEN}`,
      }
    });

    const { qr, deeplink } = response.data;
    res.json({ qr, deeplink });
  } catch (error) {
    console.error("Error al crear el checkout de MODO:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Error creando la intención de pago" });
  }
};




// Controlador para manejar el webhook de MODO (sin almacenar datos)
export const receiveModoWebhook = async (req, res) => {
  const io = req.app.locals.io;

  if (!io) {
    return res.status(500).json({ message: 'Error: io no está definido' });
  }

  console.log('Webhook de MODO recibido con éxito:', req.body);

  try {
    const { external_intention_id: externalIntentionId, status, amount, message } = req.body;
    const socketId = message; // Recibir socketId desde message directamente

    if (!socketId) {
      console.error('Error: Socket ID no proporcionado en el mensaje');
      return res.status(400).json({ message: 'Socket ID no proporcionado' });
    }

    console.log('Socket ID recuperado del mensaje:', socketId);

    const eventType = status === 'APPROVED' ? 'paymentSuccess' : 'paymentFailed';

    // Emitir el evento directamente al socket correspondiente
    io.to(socketId).emit(eventType, {
      status,
      paymentId: externalIntentionId,
      amount,
    });

    console.log(`Evento "${eventType}" emitido correctamente al socket ID: ${socketId}`);
    res.sendStatus(200); // Confirmar recepción del webhook
  } catch (error) {
    console.error('Error procesando el webhook de MODO:', error);
    res.status(500).json({ message: 'Error al procesar el webhook de MODO' });
  }
};
