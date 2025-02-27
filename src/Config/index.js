import { config } from "dotenv";
config();

export const MERCADOPAGO_API_KEY = process.env.MERCADOPAGO_API_KEY;
export const notification_url= process.env.NOTIFICATION_URL