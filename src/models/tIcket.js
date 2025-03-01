import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  width: { type: String, required: true },
  height: { type: String, required: true },
  fontSize: { type: String, required: true },
  textAlign: { type: String, required: true },
  businessName: { type: String, required: true },
  date: { type: String, required: true },
  
  printTicket: { type: Boolean, default: true }, // ✅ Nuevo campo para habilitar/deshabilitar la impresión
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema); // 📌 Nombre en minúsculas

export default Ticket;
