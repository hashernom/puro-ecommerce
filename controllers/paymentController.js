/**
 * Controlador de pagos con Stripe para PURO E-commerce
 */

const stripe = require('../config/stripe');
const { Order, OrderDetail, Product, User, sequelize } = require('../models');
const Cart = require('../models/Cart');

class PaymentController {
    
    /**
     * Crear sesión de checkout de Stripe
     */
    static async createCheckoutSession(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const userId = req.session.user.id;
            const { shipping_address, notes } = req.body;
            
            // Obtener carrito de sesión
            const cart = req.session.cart ? Cart.fromJSON(req.session.cart) : new Cart();
            if (cart.isEmpty()) {
                return res.status(400).json({ success: false, message: 'El carrito está vacío' });
            }
            
            const cartItems = cart.getItems();
            
            // Verificar stock y productos activos
            const stockErrors = [];
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
            
            // Crear pedido en estado 'pending' (se confirmará tras pago)
            const order = await Order.create({
                user_id: userId,
                total_amount: cart.getTotal(),
                status: 'pending',
                shipping_address,
                notes
            }, { transaction });
            
            // Crear detalles del pedido
            for (const item of cartItems) {
                await OrderDetail.create({
                    order_id: order.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.price
                }, { transaction });
            }
            
            // Preparar line items para Stripe
            const lineItems = cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: item.image_url ? [item.image_url] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // en centavos
                },
                quantity: item.quantity,
            }));
            
            // Crear sesión de checkout en Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
                cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/cancel?order_id=${order.id}`,
                customer_email: req.session.user.email,
                metadata: {
                    order_id: order.id.toString(),
                    user_id: userId.toString(),
                },
            });
            
            // Guardar session_id en el pedido
            await order.update({ stripe_session_id: session.id }, { transaction });
            
            await transaction.commit();
            
            // Mantener carrito hasta confirmación de pago
            // (se vaciará en webhook o success)
            
            res.json({ 
                success: true, 
                sessionId: session.id,
                url: session.url,
                orderId: order.id
            });
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error creando sesión de checkout:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al procesar el pago',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    /**
     * Página de éxito de pago
     */
    static async paymentSuccess(req, res) {
        try {
            const { session_id, order_id } = req.query;
            
            if (!session_id || !order_id) {
                return res.redirect('/orders/user');
            }
            
            // Verificar sesión en Stripe
            const session = await stripe.checkout.sessions.retrieve(session_id);
            
            if (session.payment_status === 'paid') {
                const order = await Order.findOne({ 
                    where: { id: order_id, stripe_session_id: session_id }
                });
                
                if (order && order.status === 'pending') {
                    const transaction = await sequelize.transaction();
                    try {
                        // Actualizar estado del pedido
                        await order.update({ status: 'processing' }, { transaction });
                        
                        // Reducir stock
                        const orderDetails = await OrderDetail.findAll({
                            where: { order_id: order.id },
                            include: [{ model: Product, as: 'product' }],
                            transaction
                        });
                        
                        for (const detail of orderDetails) {
                            await detail.product.decrement('stock', {
                                by: detail.quantity,
                                transaction
                            });
                        }
                        
                        await transaction.commit();
                        
                        // Vaciar carrito de sesión
                        req.session.cart = new Cart().toJSON();
                        
                        // Mostrar página de éxito
                        return res.render('orders/payment-success', {
                            title: '¡Pago Exitoso! - PURO',
                            order,
                            session
                        });
                    } catch (error) {
                        await transaction.rollback();
                        throw error;
                    }
                }
            }
            
            // Si algo falla, redirigir a lista de pedidos
            res.redirect('/orders/user');
            
        } catch (error) {
            console.error('Error en paymentSuccess:', error);
            res.redirect('/orders/user');
        }
    }
    
    /**
     * Página de cancelación de pago
     */
    static async paymentCancel(req, res) {
        const { order_id } = req.query;
        
        if (order_id) {
            // Opcional: cambiar estado del pedido a 'cancelled' si se desea
            await Order.update(
                { status: 'cancelled' },
                { where: { id: order_id, status: 'pending' } }
            );
        }
        
        res.render('orders/payment-cancel', {
            title: 'Pago Cancelado - PURO',
            orderId: order_id
        });
    }
    
    /**
     * Webhook de Stripe para eventos de pago
     */
    static async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('⚠️  Error de firma webhook:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        // Manejar eventos
        switch (event.type) {
            case 'checkout.session.completed':
                await PaymentController.handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                console.log('Pago confirmado:', event.data.object.id);
                break;
            default:
                console.log(`Evento no manejado: ${event.type}`);
        }
        
        res.json({ received: true });
    }
    
    /**
     * Procesar sesión de checkout completada
     */
    static async handleCheckoutSessionCompleted(session) {
        const transaction = await sequelize.transaction();
        try {
            const orderId = session.metadata.order_id;
            const order = await Order.findByPk(orderId, { transaction });
            
            if (order && order.status === 'pending') {
                await order.update({ 
                    status: 'processing',
                    stripe_payment_intent: session.payment_intent
                }, { transaction });
                
                // Reducir stock
                const orderDetails = await OrderDetail.findAll({
                    where: { order_id: order.id },
                    include: [{ model: Product, as: 'product' }],
                    transaction
                });
                
                for (const detail of orderDetails) {
                    await detail.product.decrement('stock', {
                        by: detail.quantity,
                        transaction
                    });
                }
                
                await transaction.commit();
                console.log(`✅ Pedido ${orderId} procesado tras webhook.`);
            } else {
                await transaction.rollback();
            }
        } catch (error) {
            await transaction.rollback();
            console.error('Error procesando webhook:', error);
        }
    }
    
    /**
     * Obtener detalles de un pedido para mostrar en página de éxito
     */
    static async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.session.user.id;
            const isAdmin = req.session.user.role === 'admin';
            
            const where = { id: orderId };
            if (!isAdmin) where.user_id = userId;
            
            const order = await Order.findOne({
                where,
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
                    { 
                        model: OrderDetail, as: 'orderDetails',
                        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] }]
                    }
                ]
            });
            
            if (!order) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            
            res.json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = PaymentController;