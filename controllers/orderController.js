const { Order, OrderDetail, Product, User, CartItem, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Cart = require('../models/Cart');

class OrderController {
    static showCart(req, res) {
        res.render('orders/cart', { title: 'Mi Carrito - PURO Premium Natural Shots' });
    }

    static async getCart(req, res) {
        try {
            let cart;
            
            // Si el usuario está autenticado, obtener carrito persistente
            if (req.session.user) {
                const userId = req.session.user.id;
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
                
                cart = new Cart(cartItems);
                // Sincronizar con sesión
                req.session.cart = cart.toJSON();
            } else {
                // Usuario no autenticado, usar solo sesión
                cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            }
            
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

    static async addToCart(req, res) {
        try {
            const { productId, quantity = 1 } = req.body;
            const product = await Product.findOne({ where: { id: productId, is_active: true } });
            
            if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            if (!product.isAvailable(quantity)) return res.status(400).json({ success: false, message: `Stock insuficiente. Disponible: ${product.stock}` });
            
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            const existingItem = cart.getItems().find(i => i.productId === productId);
            const totalRequested = quantity + (existingItem ? existingItem.quantity : 0);
            
            if (totalRequested > product.stock) return res.status(400).json({ success: false, message: `Stock disponible: ${product.stock}` });
            
            cart.addProduct(product, quantity);
            req.session.cart = cart.toJSON();
            
            // Si el usuario está autenticado, persistir en base de datos
            if (req.session.user) {
                await CartItem.addOrUpdate(req.session.user.id, productId, quantity);
            }
            
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

    static async updateCartItem(req, res) {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;
            
            if (quantity < 0) return res.status(400).json({ success: false, message: 'La cantidad no puede ser negativa' });
            
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            cart.updateQuantity(parseInt(productId), quantity);
            req.session.cart = cart.toJSON();
            
            // Si el usuario está autenticado, actualizar en base de datos
            if (req.session.user) {
                if (quantity === 0) {
                    await CartItem.removeFromCart(req.session.user.id, parseInt(productId));
                } else {
                    await CartItem.addOrUpdate(req.session.user.id, parseInt(productId), quantity);
                }
            }
            
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

    static async removeFromCart(req, res) {
        try {
            const { productId } = req.params;
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            cart.removeProduct(parseInt(productId));
            req.session.cart = cart.toJSON();
            
            // Si el usuario está autenticado, eliminar de base de datos
            if (req.session.user) {
                await CartItem.removeFromCart(req.session.user.id, parseInt(productId));
            }
            
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

    static clearCart(req, res) {
        req.session.cart = new Cart().toJSON();
        
        // Si el usuario está autenticado, limpiar carrito en base de datos
        if (req.session.user) {
            CartItem.clearUserCart(req.session.user.id).catch(console.error);
        }
        
        res.json({ 
            success: true, 
            message: 'Carrito vaciado', 
            data: { 
                items: [], 
                total: 0, 
                totalItems: 0 
            } 
        });
    }

    static async createOrder(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { shipping_address, notes } = req.body;
            const userId = req.session.user.id;
            
            // Obtener carrito (combinando sesión y BD)
            let cart;
            if (req.session.cart) {
                cart = Cart.fromJSON(req.session.cart);
            } else {
                // Si no hay carrito en sesión, obtener de BD
                const dbCartItems = await CartItem.getUserCart(userId);
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
                cart = new Cart(cartItems);
            }
            
            if (cart.isEmpty()) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'El carrito está vacío' });
            }
            
            const cartItems = cart.getItems();
            const stockErrors = [];
            
            // Verificar stock
            for (const item of cartItems) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (!product || !product.is_active) {
                    stockErrors.push(`Producto ${item.name} no disponible`);
                } else if (product.stock < item.quantity) {
                    stockErrors.push(`Stock insuficiente para ${item.name}. Disponible: ${product.stock}`);
                }
            }
            
            if (stockErrors.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, errors: stockErrors });
            }
            
            // Crear orden
            const order = await Order.create({
                user_id: userId,
                total_amount: cart.getTotal(),
                status: 'pending',
                shipping_address,
                notes
            }, { transaction });
            
            // Crear detalles de orden y actualizar stock
            for (const item of cartItems) {
                await OrderDetail.create({
                    order_id: order.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.price
                }, { transaction });
                
                await Product.decrement('stock', {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction
                });
            }
            
            await transaction.commit();
            
            // Limpiar carrito después de orden exitosa
            req.session.cart = new Cart().toJSON();
            await CartItem.clearUserCart(userId);
            
            res.status(201).json({
                success: true,
                message: 'Pedido creado correctamente',
                data: { orderId: order.id }
            });
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error creando pedido:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getUserOrders(req, res) {
        try {
            const userId = req.session.user.id;
            const orders = await Order.findAll({
                where: { user_id: userId },
                include: [{
                    model: OrderDetail,
                    as: 'orderDetails',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image_url']
                    }]
                }],
                order: [['created_at', 'DESC']]
            });
            res.json({ success: true, data: orders });
        } catch (error) {
            console.error('Error obteniendo órdenes:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async cancelOrder(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findOne({
                where: { id: req.params.id, user_id: req.session.user.id },
                include: [{
                    model: OrderDetail,
                    as: 'orderDetails',
                    include: [Product]
                }],
                transaction
            });
            
            if (!order) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            
            if (!order.canBeCancelled()) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Este pedido no se puede cancelar' });
            }
            
            // Restaurar stock
            for (const detail of order.orderDetails) {
                await detail.product.update({
                    stock: detail.product.stock + detail.quantity
                }, { transaction });
            }
            
            await order.update({ status: 'cancelled' }, { transaction });
            await transaction.commit();
            
            res.json({ success: true, message: 'Pedido cancelado correctamente' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error cancelando pedido:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async showOrderDetail(req, res) {
        try {
            const userId = req.session.user.id;
            const isAdmin = req.session.user.role === 'admin';
            const where = { id: req.params.id };
            
            if (!isAdmin) where.user_id = userId;

            const order = await Order.findOne({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    },
                    {
                        model: OrderDetail,
                        as: 'orderDetails',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'image_url']
                        }]
                    }
                ]
            });
            
            if (!order) {
                return res.status(404).render('error', {
                    title: 'Pedido no encontrado',
                    message: 'Este pedido no existe.',
                    statusCode: 404
                });
            }
            
            res.render('orders/detail', {
                title: `Pedido #${order.id} - PURO`,
                order
            });
        } catch (error) {
            console.error('showOrderDetail error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error del servidor',
                statusCode: 500
            });
        }
    }
}

module.exports = OrderController;
