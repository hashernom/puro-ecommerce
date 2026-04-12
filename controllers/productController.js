const { Product, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class ProductController {

    // ── Vista: Catálogo ───────────────────────────────────────────────────
    static async showCatalog(req, res) {
        res.render('products/catalog', { title: 'Catálogo - PURO Premium Natural Shots' });
    }

    // ── Vista: Detalle de producto ────────────────────────────────────────
    static async showDetail(req, res) {
        try {
            const product = await Product.findOne({
                where: { id: req.params.id, is_active: true }
            });
            if (!product) return res.status(404).render('error', {
                title: 'Producto no encontrado', message: 'Este producto no existe.', statusCode: 404
            });
            res.render('products/detail', {
                title: `${product.name} - PURO`,
                product
            });
        } catch (error) {
            console.error('showDetail error:', error);
            res.status(500).render('error', { title: 'Error', message: 'Error del servidor', statusCode: 500 });
        }
    }

    // ── API: Listar productos públicos ────────────────────────────────────
    static async listProducts(req, res) {
        try {
            const {
                page = 1,
                limit = 12,
                search = '',
                sort = 'created_at',
                order = 'DESC',
                category = '',
                minPrice = '',
                maxPrice = '',
                inStock = ''
            } = req.query;
            
            const offset = (page - 1) * limit;
            const where = { is_active: true };
            
            // Filtro de búsqueda
            if (search) where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
            
            // Filtro por categoría
            if (category && category !== 'all') {
                where.category = category;
            }
            
            // Filtro por rango de precio
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
                if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
            }
            
            // Filtro por disponibilidad
            if (inStock === 'true') {
                where.stock = { [Op.gt]: 0 };
            } else if (inStock === 'false') {
                where.stock = 0;
            }
            
            // Obtener todas las categorías disponibles para los filtros
            const categories = await Product.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
                where: { is_active: true },
                raw: true
            });
            
            const { count, rows: products } = await Product.findAndCountAll({
                where,
                order: [[sort, order]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            res.json({
                success: true,
                data: {
                    products,
                    categories: categories.map(c => c.category).filter(Boolean),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalProducts: count
                }
            }});
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Producto por ID ───────────────────────────────────────────────
    static async getProduct(req, res) {
        try {
            const product = await Product.findOne({ where: { id: req.params.id, is_active: true } });
            if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            res.json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Crear producto (admin) ────────────────────────────────────────
    static async createProduct(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
            const { name, description, price, stock, image_url } = req.body;
            const existing = await Product.findOne({ where: { name } });
            if (existing) return res.status(400).json({ success: false, message: 'Ya existe un producto con ese nombre' });
            const product = await Product.create({
                name, description, price, stock,
                image_url: image_url || '/images/default-product.svg'
            });
            res.status(201).json({ success: true, message: 'Producto creado', data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Actualizar producto (admin) ──────────────────────────────────
    static async updateProduct(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
            const { id } = req.params;
            const product = await Product.findByPk(id);
            if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            const { name, description, price, stock, image_url, is_active } = req.body;
            if (name && name !== product.name) {
                const dup = await Product.findOne({ where: { name, id: { [Op.ne]: id } } });
                if (dup) return res.status(400).json({ success: false, message: 'Nombre duplicado' });
            }
            await product.update({ name, description, price, stock, image_url, is_active });
            res.json({ success: true, message: 'Producto actualizado', data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Eliminar producto (soft delete) ──────────────────────────────
    static async deleteProduct(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            await product.update({ is_active: false });
            res.json({ success: true, message: 'Producto desactivado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Listar todos los productos (admin, incluye inactivos) ─────────
    static async adminListProducts(req, res) {
        try {
            const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
            if (status !== 'all') where.is_active = status === 'active';
            const { count, rows: products } = await Product.findAndCountAll({
                where, order: [['created_at', 'DESC']], limit: parseInt(limit), offset: parseInt(offset)
            });
            res.json({ success: true, data: { products, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(count / limit), totalProducts: count } } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = ProductController;
