/**
 * Controlador para manejo de imágenes de productos
 */

const { Product } = require('../models');
const { getImageUrl, deleteImage } = require('../config/upload');

class ImageController {
    
    /**
     * Subir imagen para un producto (creación)
     */
    static async uploadProductImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se proporcionó ninguna imagen' 
                });
            }
            
            const imageUrl = getImageUrl(req.file.filename);
            
            res.json({
                success: true,
                message: 'Imagen subida correctamente',
                data: {
                    filename: req.file.filename,
                    url: imageUrl,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
            
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al subir la imagen' 
            });
        }
    }
    
    /**
     * Actualizar imagen de un producto existente
     */
    static async updateProductImage(req, res) {
        try {
            const { id } = req.params;
            
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se proporcionó ninguna imagen' 
                });
            }
            
            // Buscar producto
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
            
            // Eliminar imagen anterior si no es la predeterminada
            if (product.image_url && !product.image_url.includes('default-product')) {
                deleteImage(product.image_url);
            }
            
            // Actualizar con nueva imagen
            const newImageUrl = getImageUrl(req.file.filename);
            await product.update({ image_url: newImageUrl });
            
            res.json({
                success: true,
                message: 'Imagen actualizada correctamente',
                data: {
                    productId: product.id,
                    imageUrl: newImageUrl
                }
            });
            
        } catch (error) {
            console.error('Error actualizando imagen:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al actualizar la imagen' 
            });
        }
    }
    
    /**
     * Eliminar imagen de un producto
     */
    static async deleteProductImage(req, res) {
        try {
            const { id } = req.params;
            
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
            
            // Verificar si tiene imagen personalizada
            if (!product.image_url || product.image_url.includes('default-product')) {
                return res.json({ 
                    success: true, 
                    message: 'El producto ya usa la imagen predeterminada' 
                });
            }
            
            // Eliminar imagen del sistema de archivos
            deleteImage(product.image_url);
            
            // Restaurar imagen predeterminada
            await product.update({ image_url: '/images/default-product.jpg' });
            
            res.json({
                success: true,
                message: 'Imagen eliminada correctamente',
                data: {
                    productId: product.id,
                    imageUrl: '/images/default-product.jpg'
                }
            });
            
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al eliminar la imagen' 
            });
        }
    }
    
    /**
     * Obtener URL de imagen para un producto
     */
    static async getProductImage(req, res) {
        try {
            const { id } = req.params;
            
            const product = await Product.findByPk(id, {
                attributes: ['id', 'name', 'image_url']
            });
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
            
            res.json({
                success: true,
                data: {
                    productId: product.id,
                    productName: product.name,
                    imageUrl: product.image_url || '/images/default-product.jpg'
                }
            });
            
        } catch (error) {
            console.error('Error obteniendo imagen:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener la imagen' 
            });
        }
    }
}

module.exports = ImageController;