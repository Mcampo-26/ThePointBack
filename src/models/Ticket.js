
import mongoose from "mongoose";


const ticketSchema = new mongoose.Schema({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  titleFontSize: { type: Number, required: true },
  productFontSize: { type: Number, required: true },
  priceFontSize: { type: Number, required: true },
  totalFontSize: { type: Number, required: true },
  footerFontSize: { type: Number, required: true },
  dateFontSize: { type: Number, required: true },  // ✅ Asegurar que está en el esquema
  textAlign: { type: String, required: true },
  businessName: { type: String, required: true },
  date: { type: String, required: true },
  paperSize: { type: String, required: true },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
