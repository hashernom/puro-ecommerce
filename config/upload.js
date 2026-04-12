/**
 * Configuración de carga de imágenes para PURO E-commerce
 * Usa almacenamiento local en desarrollo y Cloudinary en producción
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

/**
 * Middleware para manejar errores de carga
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'La imagen es demasiado grande (máximo 5MB)' 
            });
        }
        return res.status(400).json({ 
            success: false, 
            message: 'Error al cargar la imagen' 
        });
    } else if (err) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    next();
};

/**
 * Generar URL para la imagen subida
 */
const getImageUrl = (filename) => {
    if (!filename) return '/images/default-product.jpg';
    
    // En desarrollo, usar ruta local
    if (process.env.NODE_ENV === 'development' || !process.env.CLOUDINARY_CLOUD_NAME) {
        return `/uploads/${filename}`;
    }
    
    // En producción, usar Cloudinary (si se configura)
    return `/uploads/${filename}`; // Por ahora mantenemos local
};

/**
 * Eliminar imagen del sistema de archivos
 */
const deleteImage = (imageUrl) => {
    if (!imageUrl || imageUrl.includes('default-product')) {
        return;
    }
    
    try {
        const filename = path.basename(imageUrl);
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error eliminando imagen:', error);
    }
};

module.exports = {
    upload,
    handleUploadError,
    getImageUrl,
    deleteImage
};