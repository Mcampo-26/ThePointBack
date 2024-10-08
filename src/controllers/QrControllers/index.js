<<<<<<< HEAD
import Qr from '../../models/Qr.js';

// Crear un nuevo QR y guardarlo en la base de datos
export const createQr = async (req, res) => {
  const { qrCodeData, amount, products } = req.body;

  try {
    const newQr = new Qr({
      qrCodeData, // Datos del QR, como la URL o algún identificador
      transactions: [
        {
          amount, // Monto asociado a la transacción
          status: 'pending', // Estado inicial
          products, // Productos relacionados con la transacción
=======
export const createQr = async (req, res) => {
  const { qrCodeData, amount, productName, productPrice } = req.body; // Recibe también nombre y precio del producto

  try {
    const newQr = new Qr({
      qrCodeData: qrCodeData, // Datos del QR, como la URL o algún identificador
      transactions: [
        {
          amount: amount,
          status: 'pending', // Estado inicial
          productName: productName, // Guardar el nombre del producto
          productPrice: productPrice, // Guardar el precio del producto
>>>>>>> eb43de2c9f6e9f0c31b86c137df7314a604342b8
        },
      ],
    });

    // Guardar el QR en la base de datos
    await newQr.save();
    res.status(201).json({ message: 'QR creado exitosamente', qr: newQr });
  } catch (error) {
    console.error('Error al crear el QR:', error);
    res.status(500).json({ message: 'Error al crear el QR' });
  }
};
<<<<<<< HEAD

// Validar si un QR es válido antes de proceder con el pago
export const validateQrBeforePayment = async (req, res) => {
  const { qrId } = req.body;

  try {
    const qr = await Qr.findById(qrId);

    if (!qr) {
      return res.status(404).json({ message: 'QR no encontrado' });
    }

    // Verificar si el QR ya ha sido utilizado o tiene una transacción pendiente
    const existingTransaction = qr.transactions.find(
      (transaction) => transaction.status === 'completed' || transaction.status === 'pending'
    );

    if (existingTransaction) {
      return res.status(400).json({ message: 'Este QR ya ha sido usado o tiene un pago pendiente' });
    }

    // Si todo está bien, devolver éxito
    res.status(200).json({ message: 'QR válido para el pago' });
  } catch (error) {
    console.error('Error al validar el QR:', error);
    res.status(500).json({ message: 'Error al validar el QR' });
  }
};

// Actualizar el estado del QR después de completar un pago
export const updateQrStatusAfterPayment = async (req, res) => {
  const { qrId, status } = req.body;

  try {
    const qr = await Qr.findById(qrId);

    if (!qr) {
      return res.status(404).json({ message: 'QR no encontrado' });
    }

    // Actualizar el estado de la transacción
    const transactionIndex = qr.transactions.findIndex((transaction) => transaction.status === 'pending');
    
    if (transactionIndex !== -1) {
      qr.transactions[transactionIndex].status = status === 'approved' ? 'completed' : 'failed';
      await qr.save();
    }

    res.status(200).json({ message: 'Estado del QR actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado del QR:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del QR' });
  }
};
=======
>>>>>>> eb43de2c9f6e9f0c31b86c137df7314a604342b8
