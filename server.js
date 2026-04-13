const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const { loadUser } = require('./middleware/auth');
const { generateToken, doubleCsrfProtection } = require('./middleware/csrf');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const adminRoutes   = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const imageRoutes   = require('./routes/images');

const app  = express();
const PORT = process.env.PORT || 3001;
const ENV  = process.env.NODE_ENV || 'development';

// ── Validación de variables de entorno críticas ────────────────────────────
const validateEnvVars = () => {
    const criticalVars = ['SESSION_SECRET'];
    
    if (ENV === 'production') {
        const missingVars = criticalVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`❌ Variables de entorno críticas faltantes en producción: ${missingVars.join(', ')}`);
        }
    }
    
    // Advertencias en desarrollo
    criticalVars.forEach(varName => {
        if (!process.env[varName]) {
            console.warn(`⚠️  Advertencia: ${varName} no está definida. Usando valor por defecto (inseguro para producción).`);
        }
    });
};

// Ejecutar validación
validateEnvVars();

// ── Seguridad ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    styleSrc:   ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
    scriptSrc:  ["'self'", "https://cdn.jsdelivr.net"],
    imgSrc:     ["'self'", "data:", "https:"],
    fontSrc:    ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"]
}}}));

// Headers de seguridad adicionales
app.use((req, res, next) => {
    // X-Content-Type-Options: previene MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options: previene clickjacking (Helmet ya lo hace, pero lo reforzamos)
    res.setHeader('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection: protección XSS (para navegadores antiguos)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer-Policy: controla información del referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy: controla características del navegador
    res.setHeader('Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    // Cache-Control para respuestas sensibles
    if (req.path.includes('/admin') || req.path.includes('/auth')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    
    next();
});

// Configuración CORS segura
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    methods: process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS.split(',') : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: process.env.ALLOWED_HEADERS ? process.env.ALLOWED_HEADERS.split(',') : ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ── Rate Limiting ─────────────────────────────────────────────────────────
// Limitar peticiones para prevenir ataques de fuerza bruta y DDoS
// En desarrollo, límites más altos para facilitar testing
const isDevelopment = ENV === 'development';

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 1000 : 100, // 1000 en desarrollo, 100 en producción
    message: {
        success: false,
        error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos'
    },
    standardHeaders: true, // Retorna información de rate limit en headers
    legacyHeaders: false, // Desactiva headers legacy
});

// Limiter más estricto para autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 100 : 10, // 100 en desarrollo, 10 en producción
    message: {
        success: false,
        error: 'Demasiados intentos de autenticación, por favor intenta de nuevo en 15 minutos'
    },
    skipSuccessfulRequests: true, // No contar peticiones exitosas
});

// Aplicar rate limiting
app.use(generalLimiter); // Aplicar a todas las rutas
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/forgot-password', authLimiter);
app.use('/auth/reset-password', authLimiter);

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

// Generar secret de sesión seguro
const getSessionSecret = () => {
    if (process.env.SESSION_SECRET) {
        return process.env.SESSION_SECRET;
    }
    
    // Solo en desarrollo: generar un secret aleatorio
    if (ENV === 'development') {
        const crypto = require('crypto');
        const devSecret = crypto.randomBytes(32).toString('hex');
        console.warn(`⚠️  SESSION_SECRET no definida. Usando secret aleatorio para desarrollo: ${devSecret.substring(0, 16)}...`);
        return devSecret;
    }
    
    // En producción, la validación ya falló, pero por si acaso
    throw new Error('SESSION_SECRET no está definida para entorno de producción');
};

app.use(session({
    secret: getSessionSecret(),
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
 
