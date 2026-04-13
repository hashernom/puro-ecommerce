const express = require('express');
const router  = express.Router();
const ProductController = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateProduct, validateProductUpdate, handleValidationErrors } = require('../middleware/validation');

// ── Vistas públicas ────────────────────────────────────────────────────────
router.get('/',    ProductController.showCatalog);

// ── API pública ────────────────────────────────────────────────────────────
router.get('/api',     ProductController.listProducts);
router.get('/api/:id', ProductController.getProduct);

// ── Detalle de producto (debe ir después de rutas específicas) ────────────
router.get('/:id', ProductController.showDetail);

// ── API admin ──────────────────────────────────────────────────────────────
router.get('/admin/list', requireAuth, requireAdmin, ProductController.adminListProducts);
router.post('/',          requireAuth, requireAdmin, validateProduct,       handleValidationErrors, ProductController.createProduct);
router.put('/:id',        requireAuth, requireAdmin, validateProductUpdate, handleValidationErrors, ProductController.updateProduct);
router.delete('/:id',     requireAuth, requireAdmin, ProductController.deleteProduct);

module.exports = router;
