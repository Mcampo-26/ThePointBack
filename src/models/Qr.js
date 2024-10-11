import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Subesquema para almacenar las transacciones
const transactionSchema = new Schema({
  transactionDate: {
    type: Date,
    default: Date.now, // Almacena la fecha y hora automáticamente
  },
  amount: {
    type: Number,
    required: true, // Cantidad asociada a la transacción
  },
  productName: {
    type: String,
    required: true, // Nombre del producto
  },
  productPrice: {
    type: Number,
    required: true, // Precio del producto
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
});

// Esquema principal para el QR
const qrSchema = new Schema({
  qrCodeData: {
    type: String,
    required: true, // Los datos del QR, por ejemplo, una URL o texto encriptado
  },
  socketId: {
    type: String, // Asociar el socketId con el QR
    required: true, // Este campo será obligatorio para enviar notificaciones correctamente
  },
  transactions: [transactionSchema], // Cada transacción asociada a este QR
  createdAt: {
    type: Date,
    default: Date.now, // Almacena la fecha de creación del QR
  },
});

// Modelo de QR
const Qr = mongoose.model('Qr', qrSchema);

export default Qr;
