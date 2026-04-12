const { User, Product, Order, OrderDetail, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminController {

    // ── Dashboard ─────────────────────────────────────────────────────────
    static async dashboard(req, res) {
        try {
            // Estadísticas básicas
            const totalUsers    = await User.count({ where: { role: 'client' } });
            const totalProducts = await Product.count({ where: { is_active: true } });
            const totalOrders   = await Order.count();
            const totalRevenue  = await Order.sum('total_amount', {
                where: { status: { [Op.in]: ['processing', 'shipped', 'delivered'] } }
            }) || 0;

            // Estadísticas de pedidos por estado
            const orderStatusStats = await Order.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
                ],
                group: ['status'],
                raw: true
            });

            // Pedidos del último mes
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            const recentMonthOrders = await Order.count({
                where: { created_at: { [Op.gte]: oneMonthAgo } }
            });
            
            const recentMonthRevenue = await Order.sum('total_amount', {
                where: {
                    created_at: { [Op.gte]: oneMonthAgo },
                    status: { [Op.in]: ['processing', 'shipped', 'delivered'] }
                }
            }) || 0;

            // Pedidos recientes con más detalles
            const recentOrders = await Order.findAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email']
                    },
                    {
                        model: OrderDetail,
                        as: 'orderDetails',
                        attributes: ['quantity'],
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['name']
                        }]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: 10
            });

            // Productos con bajo stock
            const lowStockProducts = await Product.findAll({
                where: { stock: { [Op.lte]: 5 }, is_active: true },
                order: [['stock', 'ASC']],
                limit: 10
            });

            // Productos más vendidos (último mes)
            const topProducts = await OrderDetail.findAll({
                attributes: [
                    'product_id',
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
                ],
                include: [{
                    model: Order,
                    as: 'order',
                    where: {
                        created_at: { [Op.gte]: oneMonthAgo },
                        status: { [Op.in]: ['processing', 'shipped', 'delivered'] }
                    },
                    attributes: []
                }],
                group: ['product_id'],
                order: [[sequelize.literal('total_sold'), 'DESC']],
                limit: 5,
                raw: true
            });

            // Enriquecer productos más vendidos con información del producto
            const enrichedTopProducts = [];
            for (const item of topProducts) {
                const product = await Product.findByPk(item.product_id, {
                    attributes: ['id', 'name', 'price', 'image_url']
                });
                if (product) {
                    enrichedTopProducts.push({
                        ...item,
                        product_name: product.name,
                        product_price: product.price,
                        product_image: product.image_url
                    });
                }
            }

            // Calcular promedio de pedido
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            res.render('admin/dashboard', {
                title: 'Dashboard - PURO Admin',
                stats: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    recentMonthOrders,
                    recentMonthRevenue,
                    averageOrderValue: averageOrderValue.toFixed(2)
                },
                orderStatusStats,
                recentOrders,
                lowStockProducts,
                topProducts: enrichedTopProducts
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', { title: 'Error', message: 'Error del servidor', statusCode: 500 });
        }
    }

    // ── Vista HTML: Gestión de productos ─────────────────────────────────
    static async showProducts(req, res) {
        try {
            const { search = '', status = 'all', page = 1 } = req.query;
            const limit = 15;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
            if (status !== 'all') where.is_active = status === 'active';

            const { count, rows: products } = await Product.findAndCountAll({
                where, order: [['created_at', 'DESC']], limit, offset
            });
            res.render('admin/products', {
                title: 'Gestión de Productos - PURO Admin',
                products, search, status,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalProducts: count
            });
        } catch (error) {
            console.error('Admin showProducts error:', error);
            res.status(500).render('error', { title: 'Error', message: 'Error del servidor', statusCode: 500 });
        }
    }

    // ── Vista HTML: Gestión de pedidos ────────────────────────────────────
    static async showOrders(req, res) {
        try {
            const { status = 'all', page = 1 } = req.query;
            const limit = 15;
            const offset = (page - 1) * limit;
            const where = {};
            if (status !== 'all') where.status = status;

            const { count, rows: orders } = await Order.findAndCountAll({
                where,
                include: [
                    { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: OrderDetail, as: 'orderDetails',
                      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
                ],
                order: [['created_at', 'DESC']], limit, offset
            });
            res.render('admin/orders', {
                title: 'Gestión de Pedidos - PURO Admin',
                orders, status,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalOrders: count
            });
        } catch (error) {
            console.error('Admin showOrders error:', error);
            res.status(500).render('error', { title: 'Error', message: 'Error del servidor', statusCode: 500 });
        }
    }

    // ── Vista HTML: Gestión de usuarios ──────────────────────────────────
    static async showUsers(req, res) {
        try {
            const { search = '', role = 'all', page = 1 } = req.query;
            const limit = 15;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name:  { [Op.iLike]: `%${search}%` } },
                { email:      { [Op.iLike]: `%${search}%` } }
            ];
            if (role !== 'all') where.role = role;

            const { count, rows: users } = await User.findAndCountAll({
                where, attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']], limit, offset
            });
            res.render('admin/users', {
                title: 'Gestión de Usuarios - PURO Admin',
                users, search, role,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalUsers: count
            });
        } catch (error) {
            console.error('Admin showUsers error:', error);
            res.status(500).render('error', { title: 'Error', message: 'Error del servidor', statusCode: 500 });
        }
    }

    // ── API: Cambiar rol de usuario ───────────────────────────────────────
    static async changeUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!['client', 'admin'].includes(role))
                return res.status(400).json({ success: false, message: 'Rol inválido' });
            const user = await User.findByPk(id);
            if (!user)
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            if (user.id === req.session.user.id)
                return res.status(400).json({ success: false, message: 'No puedes cambiar tu propio rol' });
            await user.update({ role });
            res.json({ success: true, message: 'Rol actualizado', data: { id: user.id, role: user.role } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Crear producto desde admin ───────────────────────────────────
    static async createProduct(req, res) {
        try {
            const { name, description, price, stock, image_url } = req.body;
            const exists = await Product.findOne({ where: { name } });
            if (exists) return res.status(400).json({ success: false, message: 'Ya existe un producto con ese nombre' });
            const product = await Product.create({
                name, description, price: parseFloat(price),
                stock: parseInt(stock),
                image_url: image_url || '/images/default-product.svg'
            });
            res.status(201).json({ success: true, message: 'Producto creado', data: product });
        } catch (error) {
            console.error('createProduct error:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Actualizar producto desde admin ──────────────────────────────
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price, stock, image_url, is_active } = req.body;
            const product = await Product.findByPk(id);
            if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            await product.update({ name, description, price, stock, image_url, is_active });
            res.json({ success: true, message: 'Producto actualizado', data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ── API: Actualizar estado de pedido ──────────────────────────────────
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!valid.includes(status))
                return res.status(400).json({ success: false, message: 'Estado inválido' });
            const order = await Order.findByPk(id);
            if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            await order.update({ status });
            res.json({ success: true, message: 'Estado actualizado', data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = AdminController;
