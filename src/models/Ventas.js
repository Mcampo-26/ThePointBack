import mongoose from "mongoose";

const ventaSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    transactionId: {
      type: String, // ID de la transacción en Mercado Pago
      required: true,
    },
    fechaVenta: {
      type: Date,
      default: Date.now, // Guarda automáticamente la fecha y hora de la venta
      required: true,
    },
    pagador: {
      type: String, // Nombre completo del comprador
      required: false, // No es obligatorio, ya que algunos pagos no tendrán nombre registrado
    },
    emailPagador: {
      type: String, // Correo electrónico del comprador
      required: false, // No es obligatorio
    },
  },
  { timestamps: true } // Esto ya guarda `createdAt` y `updatedAt`
);

const Venta = mongoose.model("Venta", ventaSchema);
export default Venta;
