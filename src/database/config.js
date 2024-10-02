import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

export const dbConnect = async () => {
  try {
    const uri = process.env.MONGODB_URI; // URI para la base de datos
    if (!uri) {
      throw new Error('La URI de conexión no está definida en el archivo .env');
    }
    
    // Conectar a MongoDB
    await mongoose.connect(uri);  // No es necesario incluir useNewUrlParser ni useUnifiedTopology
    
    console.log('Conexión exitosa a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error);
    throw error; // Lanzar el error para manejarlo en el nivel superior si es necesario
  }
};
