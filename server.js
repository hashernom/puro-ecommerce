const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const cors = require('cors');

const { sequelize } = require('./models');
const { loadUser } = require('./middleware/auth');
const { generateToken, injectCsrfToken } = require('./middleware/csrf');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const adminRoutes   = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const imageRoutes   = require('./routes/images');

const app  = express();
const PORT = process.env.PORT || 3001;
const ENV  = process.env.NODE_ENV || 'development';

// ── Seguridad ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    styleSrc:   ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
    scriptSrc:  ["'self'", "https://cdn.jsdelivr.net"],
    imgSrc:     ["'self'", "data:", "https:"],
    fontSrc:    ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"]
}}}));
app.use(cors());

// ── Vistas y motor EJS ────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ── Body parsers y estáticos ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Sesiones ──────────────────────────────────────────────────────────────
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: process.env.SESSION_SECRET || 'puro-fallback-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: ENV === 'production',   // false en desarrollo → cookies funcionan en HTTP
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000    // 24 horas
    }
}));

sessionStore.sync();

// ── Middleware global ─────────────────────────────────────────────────────
app.use(loadUser);
app.use(generateToken); // Generar token CSRF para todas las rutas
app.use(injectCsrfToken); // Inyectar token en respuestas JSON
app.use((req, res, next) => {
    res.locals.isAdmin = req.session.user?.role === 'admin' || false;
    res.locals.user    = res.locals.user || null;
    next();
});

// ── Ruta raíz ─────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
    try {
        const { Product } = require('./models');
        const featuredProducts = await Product.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']],
            limit: 3
        });
        res.render('index', { title: 'PURO - Premium Natural Shots', featuredProducts });
    } catch (error) {
        console.error(error);
        res.render('index', { title: 'PURO - Premium Natural Shots', featuredProducts: [] });
    }
});

// ── Rutas de la aplicación ────────────────────────────────────────────────
app.use('/auth',     authRoutes);
app.use('/products', productRoutes);
app.use('/orders',   orderRoutes);
app.use('/admin',    adminRoutes);
app.use('/payment',  paymentRoutes);
app.use('/images',   imageRoutes);

// ── Manejo de errores 404 ─────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Página no encontrada',
        message: 'La página que buscas no existe.',
        statusCode: 404
    });
});

// ── Manejo de errores generales ───────────────────────────────────────────
app.use((error, req, res, next) => {
    console.error('Error:', error);
    const status = error.status || 500;
    res.status(status).render('error', {
        title: 'Error del servidor',
        message: error.message || 'Error interno.',
        statusCode: status
    });
});

// ── Arranque ──────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada.');
        await sequelize.sync();
        console.log('✅ Tablas sincronizadas.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
            console.log(`🔧 Entorno: ${ENV}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();
