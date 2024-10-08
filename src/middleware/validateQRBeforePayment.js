
import Qr from '../models/Qr.js';

const validateQRBeforePayment = async (req, res, next) => {
  const { qrId } = req.body;

  try {
    // Buscar el QR por su ID en la base de datos
    const qr = await Qr.findById(qrId);

    if (!qr) {
      return res.status(404).json({ message: 'QR no encontrado' });
    }

    // Verificar si ya hay una transacción pendiente o completada
    const existingTransaction = qr.transactions.find(
      (transaction) => transaction.status === 'completed' || transaction.status === 'pending'
    );

    if (existingTransaction) {
      return res.status(400).json({ message: 'Este QR ya ha sido usado o tiene un pago pendiente' });
    }

    // Si todo está bien, continúa con el flujo de creación del pago
    next();
  } catch (error) {
    console.error('Error validando el QR:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};



export default validateQRBeforePayment;
