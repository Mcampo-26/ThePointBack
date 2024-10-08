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
