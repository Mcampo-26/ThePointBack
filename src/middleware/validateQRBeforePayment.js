
import Qr from '../models/Qr.js';

const validateQRBeforePayment = async (req, res, next) => {
  const { qrId } = req.body;

  try {
    const qr = await Qr.findById(qrId);

    if (!qr) {
      return res.status(404).json({ message: 'QR no encontrado' });
    }

    // Verifica si el QR ya fue usado
    if (qr.status === 'used') {
      return res.status(400).json({ message: 'Este QR ya ha sido usado' });
    }

    // Si está pendiente, continúa con el pago
    next();
  } catch (error) {
    console.error('Error validando el QR:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export default validateQRBeforePayment;