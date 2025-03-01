import ticket from "../../models/ticket.js";
// 📌 Obtener configuración del ticket
export const getTicket = async (req, res) => {
  try {
    const config = await ticket.findOne();
    if (!config) {
      return res.status(404).json({ message: "No hay configuración de ticket guardada." });
    }
    res.json(config);
  } catch (error) {
    console.error("❌ Error al obtener la configuración del ticket:", error);
    res.status(500).json({ message: "Error al obtener la configuración del ticket." });
  }
};

// 📌 Guardar o actualizar configuración del ticket
export const saveTicket= async (req, res) => {
  try {
    const { width, height, fontSize, textAlign, businessName, date, printTicket } = req.body;

    // Validación de datos obligatorios
    if (!businessName || !date) {
      return res.status(400).json({ message: "Faltan datos obligatorios: businessName o date." });
    }

    let config = await ticket.findOne();

    if (config) {
      // Actualizar la configuración existente
      config.width = width;
      config.height = height;
      config.fontSize = fontSize;
      config.textAlign = textAlign;
      config.businessName = businessName;
      config.date = date;
     
      config.printTicket = printTicket;
    } else {
      // Crear una nueva configuración
      config = new ticket({ width, height, fontSize, textAlign, businessName, date, printTicket });
    }

    await config.save();
    res.status(201).json({ message: "Configuración guardada correctamente", config });
  } catch (error) {
    console.error("❌ Error al guardar la configuración del ticket:", error);
    res.status(500).json({ message: "Error al guardar la configuración del ticket." });
  }
};
