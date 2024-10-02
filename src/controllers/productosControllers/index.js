import Producto from '../../models/Producto.js'; // Asegúrate de que 'Product.js' es el nombre correcto
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Obtener todos los Productosos
export const getProductos = async (req, res) => {
  try {
    const Productoss = await Producto.find();
    res.json(Productoss);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los Productosos' });
  }
};

// Crear nuevo Productoso
export const createProductos = async (req, res) => {
  try {
    console.log('Petición recibida para crear un producto');
    
    // Verificar el cuerpo de la solicitud
    console.log('Cuerpo de la solicitud (req.body):', req.body);

    const { name, price, imageUrl } = req.body;
    console.log('Datos recibidos del cuerpo de la petición:', { name, price, imageUrl });

    // Validar que los datos obligatorios están presentes
    if (!name || !price || !imageUrl) {
      console.log('Faltan datos obligatorios: nombre, precio o URL de la imagen');
      return res.status(400).json({ message: 'El nombre, precio y la URL de la imagen son obligatorios' });
    }

    // Crear un nuevo producto con la URL de la imagen
    const newProducto = new Producto({
      name,
      price,
      image: imageUrl,
    });

    // Guardar el producto en la base de datos
    const savedProducto = await newProducto.save();
    console.log('Producto guardado exitosamente:', savedProducto);

    res.status(201).json(savedProducto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar Productoso
export const updateProductos = async (req, res) => {
  const { id } = req.params;
  const { name, price, imageUrl } = req.body;

  try {
    console.log('ID del producto a actualizar:', id);
    console.log('Datos recibidos en el cuerpo de la petición:', { name, price, imageUrl });

    // Buscar el producto por ID
    const producto = await Producto.findById(id);
    if (!producto) {
      console.log('Producto no encontrado');
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizar los campos si se proporcionan
    producto.name = name || producto.name;
    producto.price = price || producto.price;
    producto.image = imageUrl || producto.image; // Actualizar la URL de la imagen si se proporciona

    // Guardar el producto actualizado en la base de datos
    const productoActualizado = await producto.save();
    console.log('Producto actualizado exitosamente:', productoActualizado);

    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};


// Eliminar Productoso
export const deleteProductos = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica si el producto existe en la base de datos
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Si hay una imagen asociada, puedes eliminarla (esto solo aplica si estás almacenando las imágenes en tu servidor)
    if (producto.image) {
      // fs.unlinkSync(path.join(__dirname, `../public${producto.image}`)); 
      // Si solo es una URL externa, no necesitas eliminarla del servidor
      console.log('Imagen eliminada:', producto.image);
    }

    // Elimina el producto de la base de datos
    await Producto.findByIdAndDelete(id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
