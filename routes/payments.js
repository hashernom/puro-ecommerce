/**
 * Rutas de pagos con Stripe
 */

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// Webhook de Stripe (sin autenticación, raw body)
router.post('/webhook', 
    express.raw({ type: 'application/json' }),
    PaymentController.handleWebhook
);

// Rutas protegidas
router.post('/create-checkout-session', 
    requireAuth, 
    validateOrder,
    PaymentController.createCheckoutSession
);

router.get('/success', 
    requireAuth,
    PaymentController.paymentSuccess
);

router.get('/cancel', 
    requireAuth,
    PaymentController.paymentCancel
);

router.get('/order/:orderId', 
    requireAuth,
    PaymentController.getOrderDetails
);

module.exports = router;