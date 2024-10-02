import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String, // Almacena la URL de la imagen como un string
    required: true,
  },
}, {
  timestamps: true,
});

// Cambia el nombre del modelo a 'Producto'
const Producto = mongoose.model('Producto', productoSchema);

export default Producto;
