const express = require('express');
const router  = express.Router();
const ProductController = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateProduct, validateProductUpdate, handleValidationErrors } = require('../middleware/validation');

// ── Vistas públicas ────────────────────────────────────────────────────────
router.get('/',    ProductController.showCatalog);
router.get('/:id', ProductController.showDetail);       // ← detalle de producto

// ── API pública ────────────────────────────────────────────────────────────
router.get('/api',     ProductController.listProducts);
router.get('/api/:id', ProductController.getProduct);

// ── API admin ──────────────────────────────────────────────────────────────
router.get('/admin/list', requireAuth, requireAdmin, ProductController.adminListProducts);
router.post('/',          requireAuth, requireAdmin, validateProduct,       handleValidationErrors, ProductController.createProduct);
router.put('/:id',        requireAuth, requireAdmin, validateProductUpdate, handleValidationErrors, ProductController.updateProduct);
router.delete('/:id',     requireAuth, requireAdmin, ProductController.deleteProduct);

module.exports = router;
