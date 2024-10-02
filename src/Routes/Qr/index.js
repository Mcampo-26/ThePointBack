import express from 'express';
import {
  createQr,
  getQrById,
  updateQr,
  deleteQrById,
  generateQrFromBackend,
  getQrsByUser,
  getQrsByAssignedUser,
  getQrs,
  useQr,
  getQrsByEmpresa,
  getAllQrs, // Importa el nuevo controlador
} from '../../controllers/QrControllers/index.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Crear QR (requiere autenticación)
router.post('/create', authMiddleware, createQr);

// Obtener todos los QRs (requiere autenticación)
router.get('/all', authMiddleware, getAllQrs); // Nueva ruta para obtener todos los QRs

// Obtener QR por ID (requiere autenticación)
router.get('/:id', authMiddleware, getQrById);

// Actualizar QR (requiere autenticación)
router.put('/update/:id', authMiddleware, updateQr);

// Eliminar QR (requiere autenticación)
router.delete('/:id', authMiddleware, deleteQrById);

// Obtener QRs asignados a un usuario (requiere autenticación)
router.get('/assigned/:userId', authMiddleware, getQrsByAssignedUser);

// Obtener QRs de un usuario específico (requiere autenticación)
router.get('/user/:userId', authMiddleware, getQrsByUser);

// Obtener todos los QRs con paginación (requiere autenticación)
router.get('/get', authMiddleware, getQrs);

// Obtener QRs por empresa (requiere autenticación)
router.get('/empresa/:id', authMiddleware, getQrsByEmpresa);

// Generar QR desde datos (requiere autenticación)
router.post('/generate', authMiddleware, (req, res) => {
  console.log('Datos recibidos en /generate:', req.body);

  try {
    const base64Image = generateQrFromBackend(req.body);
    console.log('Imagen generada en base64:', base64Image);

    if (typeof base64Image !== 'string') {
      throw new Error('Formato de imagen no es una cadena base64');
    }

    res.status(200).json({ base64Image });
  } catch (error) {
    console.error('Error al generar QR:', error);
    res.status(500).json({ message: 'Error al generar QR', error: error.message });
  }
});

// Usar QR (requiere autenticación)
router.post('/use/:id', authMiddleware, useQr);

export default router;
