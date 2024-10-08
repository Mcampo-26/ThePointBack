import axios from "axios";


export const createModoCheckout = async (req, res) => {
    console.log("Recibiendo solicitud para crear checkout de MODO"); // L
    const { price } = req.body;
  
    try {
        console.log("Datos recibidos:", price);
      const response = await axios.post("https://api.modo.com.ar/payments", {
        amount: price,
        description: "Compra en tienda",
      });
  
      const { qr_url, deeplink } = response.data;
      console.log("Respuesta de MODO recibida:", qr_url, deeplink); //
      res.json({ qr_url, deeplink });
    } catch (error) {
      res.status(500).json({ message: "Error creando la intención de pago" });
    }
  };

// Controlador para manejar el webhook de MODO (sin almacenar datos)
export const receiveModoWebhook = async (req, res) => {
    try {
      const { paymentId, status, amount, date } = req.body;
  
      // Simplemente imprime los datos recibidos para verificarlos
      console.log("Webhook de MODO recibido:");
      console.log("ID del pago:", paymentId);
      console.log("Estado del pago:", status);
      console.log("Monto:", amount);
      console.log("Fecha de la transacción:", date);
  
      // Responder al webhook de MODO
      res.status(200).json({ message: "Webhook recibido y procesado correctamente" });
    } catch (error) {
      console.error("Error al procesar el webhook de MODO:", error);
      res.status(500).json({ message: "Error al procesar el webhook" });
    }
  };