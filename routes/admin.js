const express = require('express');
const router  = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Todas las rutas requieren auth + rol admin
router.use(requireAuth, requireAdmin);

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', AdminController.dashboard);

// ── Vistas HTML: Productos ─────────────────────────────────────────────────
router.get('/products',  AdminController.showProducts);

// ── Vistas HTML: Pedidos ───────────────────────────────────────────────────
router.get('/orders',    AdminController.showOrders);

// ── Vistas HTML: Usuarios ──────────────────────────────────────────────────
router.get('/users',     AdminController.showUsers);

// ── API: Productos ─────────────────────────────────────────────────────────
router.post('/products',         AdminController.createProduct);
router.put('/products/:id',      AdminController.updateProduct);

// ── API: Pedidos ───────────────────────────────────────────────────────────
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// ── API: Usuarios ──────────────────────────────────────────────────────────
router.put('/users/:id/role',    AdminController.changeUserRole);

module.exports = router;
