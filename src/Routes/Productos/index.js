import express from 'express';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../../controllers/productosControllers/index.js';

const router = express.Router();

// Ruta para obtener todos los productos
router.get('/', getProductos);

// Ruta para crear un nuevo producto
router.post('/', createProductos);

// Ruta para actualizar un producto
router.put('/:id', updateProductos);

// Ruta para eliminar un producto
router.delete('/:id', deleteProductos);

export default router;
