import Ticket from "../../models/Ticket.js";

// 📌 Obtener configuración del ticket
export const getTicket = async (req, res) => {
  try {
    const config = await Ticket.findOne();
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
export const saveTicket = async (req, res) => {
  try {
    const {
      width, height, titleFontSize, productFontSize, priceFontSize, 
      totalFontSize, footerFontSize, dateFontSize, textAlign, 
      businessName, paperSize
    } = req.body;

    let config = await Ticket.findOne();

    if (config) {
      // 🔥 Actualizar configuración existente
      config.width = width;
      config.height = height;
      config.titleFontSize = titleFontSize;
      config.productFontSize = productFontSize;
      config.priceFontSize = priceFontSize;
      config.totalFontSize = totalFontSize;
      config.footerFontSize = footerFontSize;
      config.dateFontSize = dateFontSize;
      config.textAlign = textAlign;
      config.businessName = businessName;
      config.paperSize = paperSize;
      await config.save();
    } else {
      // 🔥 Crear una nueva configuración si no existe
      config = new Ticket({
        width, height, titleFontSize, productFontSize, priceFontSize, 
        totalFontSize, footerFontSize, dateFontSize, textAlign, 
        businessName, paperSize
      });
      await config.save();
    }

    res.status(201).json({ message: "Configuración guardada correctamente", config });
  } catch (error) {
    console.error("❌ Error al guardar la configuración del ticket:", error);
    res.status(500).json({ message: "Error al guardar la configuración del ticket." });
  }
};
