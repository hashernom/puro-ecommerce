/**
 * Controlador para carrito persistente en base de datos
 */

const { CartItem, Product } = require('../models');
const Cart = require('../models/Cart');

class CartController {
    
    /**
     * Obtener carrito del usuario (combinando sesión y BD)
     */
    static async getUserCart(req, res) {
        try {
            const userId = req.session.user.id;
            
            // Obtener carrito de base de datos
            const dbCartItems = await CartItem.getUserCart(userId);
            
            // Convertir a formato compatible con Cart class
            const cartItems = dbCartItems.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: parseFloat(item.product.price),
                quantity: item.quantity,
                subtotal: parseFloat(item.product.price) * item.quantity,
                image_url: item.product.image_url,
                stock: item.product.stock,
                is_active: item.product.is_active
            }));
            
            // Crear instancia de Cart
            const cart = new Cart(cartItems);
            
            // Sincronizar con sesión (mantener consistencia)
            req.session.cart = cart.toJSON();
            
            res.json({ 
                success: true, 
                data: { 
                    items: cart.getItems(), 
                    total: cart.getTotal(), 
                    totalItems: cart.getTotalItems() 
                } 
            });
            
        } catch (error) {
            console.error('Error obteniendo carrito:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    /**
     * Agregar producto al carrito (persistente)
     */
    static async addToCart(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId, quantity = 1 } = req.body;
            
            // Verificar producto
            const product = await Product.findOne({ 
                where: { id: productId, is_active: true } 
            });
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
            
            if (!product.isAvailable(quantity)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Stock insuficiente. Disponible: ${product.stock}` 
                });
            }
            
            // Agregar/actualizar en base de datos
            await CartItem.addOrUpdate(userId, productId, quantity);
            
            // Actualizar carrito en sesión
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            cart.addProduct(product, quantity);
            req.session.cart = cart.toJSON();
            
            res.json({ 
                success: true, 
                message: 'Producto agregado al carrito',
                data: { 
                    items: cart.getItems(), 
                    total: cart.getTotal(), 
                    totalItems: cart.getTotalItems() 
                } 
            });
            
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    /**
     * Actualizar cantidad en carrito
     */
    static async updateCartItem(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId } = req.params;
            const { quantity } = req.body;
            
            if (quantity < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'La cantidad no puede ser negativa' 
                });
            }
            
            if (quantity === 0) {
                // Eliminar producto
                await CartItem.removeFromCart(userId, productId);
            } else {
                // Actualizar cantidad
                await CartItem.addOrUpdate(userId, productId, quantity);
            }
            
            // Actualizar carrito en sesión
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            cart.updateQuantity(parseInt(productId), quantity);
            req.session.cart = cart.toJSON();
            
            res.json({ 
                success: true, 
                data: { 
                    items: cart.getItems(), 
                    total: cart.getTotal(), 
                    totalItems: cart.getTotalItems() 
                } 
            });
            
        } catch (error) {
            console.error('Error actualizando carrito:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    /**
     * Eliminar producto del carrito
     */
    static async removeFromCart(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId } = req.params;
            
            // Eliminar de base de datos
            await CartItem.removeFromCart(userId, productId);
            
            // Actualizar carrito en sesión
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            cart.removeProduct(parseInt(productId));
            req.session.cart = cart.toJSON();
            
            res.json({ 
                success: true, 
                message: 'Producto eliminado del carrito',
                data: { 
                    items: cart.getItems(), 
                    total: cart.getTotal(), 
                    totalItems: cart.getTotalItems() 
                } 
            });
            
        } catch (error) {
            console.error('Error eliminando del carrito:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    /**
     * Vaciar carrito
     */
    static async clearCart(req, res) {
        try {
            const userId = req.session.user.id;
            
            // Vaciar base de datos
            await CartItem.clearUserCart(userId);
            
            // Vaciar sesión
            req.session.cart = new Cart().toJSON();
            
            res.json({ 
                success: true, 
                message: 'Carrito vaciado',
                data: { items: [], total: 0, totalItems: 0 } 
            });
            
        } catch (error) {
            console.error('Error vaciando carrito:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    /**
     * Sincronizar carrito de sesión con base de datos (al iniciar sesión)
     */
    static async syncCartOnLogin(userId, sessionCart) {
        try {
            if (!sessionCart || sessionCart.items.length === 0) {
                return;
            }
            
            // Sincronizar carrito de sesión con base de datos
            await CartItem.syncSessionCart(userId, sessionCart.items);
            
        } catch (error) {
            console.error('Error sincronizando carrito:', error);
        }
    }
    
    /**
     * Migrar carrito de sesión a base de datos (para usuarios no autenticados que inician sesión)
     */
    static async migrateSessionCart(req, res) {
        try {
            const userId = req.session.user.id;
            const sessionCart = req.session.cart;
            
            if (sessionCart && sessionCart.items && sessionCart.items.length > 0) {
                await CartItem.syncSessionCart(userId, sessionCart.items);
                req.session.cart = new Cart().toJSON(); // Limpiar sesión después de migrar
            }
            
            res.json({ success: true, message: 'Carrito migrado correctamente' });
            
        } catch (error) {
            console.error('Error migrando carrito:', error);
            res.status(500).json({ success: false, message: 'Error migrando carrito' });
        }
    }
}

module.exports = CartController;