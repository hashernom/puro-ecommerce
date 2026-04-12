const express = require('express');
const router  = express.Router();
const OrderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateOrder, validateAddToCart, validateUpdateCart, handleValidationErrors } = require('../middleware/validation');

// ── Carrito ────────────────────────────────────────────────────────────────
router.get('/cart',          OrderController.showCart);
router.get('/cart/api',      OrderController.getCart);
router.post('/cart',         requireAuth, validateAddToCart, handleValidationErrors, OrderController.addToCart);
router.put('/cart/:productId',  requireAuth, validateUpdateCart, handleValidationErrors, OrderController.updateCartItem);
router.delete('/cart/:productId', requireAuth, OrderController.removeFromCart);
router.delete('/cart',       requireAuth, OrderController.clearCart);

// ── Pedidos del usuario ────────────────────────────────────────────────────
router.get('/user',          requireAuth, (req, res) => res.render('orders/list',   { title: 'Mis Pedidos - PURO' }));
router.get('/user/api',      requireAuth, OrderController.getUserOrders);
router.post('/',             requireAuth, validateOrder, handleValidationErrors, OrderController.createOrder);
router.get('/:id',           requireAuth, OrderController.showOrderDetail);   // ← detalle de pedido
router.put('/:id/cancel',    requireAuth, OrderController.cancelOrder);

module.exports = router;
