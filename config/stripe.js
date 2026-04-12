/**
 * Configuración de Stripe para PURO E-commerce
 */

const Stripe = require('stripe');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

module.exports = stripe;