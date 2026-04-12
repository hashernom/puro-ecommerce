/**
 * Rutas para manejo de imágenes
 */

const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/imageController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../config/upload');

// Subir imagen (para creación de producto)
router.post('/upload', 
    requireAuth, 
    requireAdmin,
    upload.single('image'),
    handleUploadError,
    ImageController.uploadProductImage
);

// Actualizar imagen de producto existente
router.put('/product/:id', 
    requireAuth, 
    requireAdmin,
    upload.single('image'),
    handleUploadError,
    ImageController.updateProductImage
);

// Eliminar imagen de producto
router.delete('/product/:id', 
    requireAuth, 
    requireAdmin,
    ImageController.deleteProductImage
);

// Obtener información de imagen de producto
router.get('/product/:id', 
    ImageController.getProductImage
);

module.exports = router;