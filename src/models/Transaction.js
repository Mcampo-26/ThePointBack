import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  externalIntentionId: { type: String, required: true }, // ID de intención de MODO
  socketId: { type: String, required: true }, // Almacena el socketId temporalmente
  status: { type: String, default: 'CREATED' }, // Estado inicial de la transacción
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);