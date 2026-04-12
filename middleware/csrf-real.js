/**
 * Middleware CSRF real usando csrf-csrf
 * Reemplaza la implementación simulada anterior
 */

const { doubleCsrf } = require("csrf-csrf");
const crypto = require('crypto');

// Generar secret CSRF seguro
const generateCsrfSecret = () => {
    return process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
};

// Configurar CSRF double submit cookie
const csrfOptions = {
    getSecret: () => generateCsrfSecret(),
    cookieName: "__Host-psifi.x-csrf-token",
    cookieOptions: {
        httpOnly: true,
        sameSite: "strict", // o "lax" para desarrollo
        path: "/",
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 // 24 horas
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromRequest: (req) => {
        // Buscar token en: body, headers, o query
        return req.body?._csrf || 
               req.headers['x-csrf-token'] || 
               req.headers['xsrf-token'] || 
               req.query?._csrf;
    }
};

const { generateToken, doubleCsrfProtection, validateRequest } = doubleCsrf(csrfOptions);

/**
 * Middleware para generar token CSRF
 * Inyecta token en locals para vistas
 */
const csrfTokenMiddleware = (req, res, next) => {
    try {
        // Generar token para esta solicitud
        const token = generateToken(req, res);
        
        // Agregar token a locals para las vistas
        res.locals.csrfToken = token;
        
        // También agregar como variable global para JavaScript
        res.locals.csrfTokenForJS = token;
        
        // Agregar header para APIs
        res.setHeader('X-CSRF-Token', token);
        
        next();
    } catch (error) {
        console.error("Error generando token CSRF:", error);
        
        // En desarrollo, permitir continuar con token simulado
        if (process.env.NODE_ENV !== 'production') {
            const devToken = 'dev-csrf-token-' + Date.now();
            res.locals.csrfToken = devToken;
            res.locals.csrfTokenForJS = devToken;
            next();
        } else {
            next(error);
        }
    }
};

/**
 * Middleware de validación CSRF
 * Usa doubleCsrfProtection para rutas que necesitan protección
 */
const validateCsrf = doubleCsrfProtection;

/**
 * Middleware para validación manual (útil para APIs)
 */
const manualCsrfValidation = (req, res, next) => {
    try {
        validateRequest(req, res);
        next();
    } catch (error) {
        if (error.message === 'Invalid CSRF token') {
            return res.status(403).json({
                success: false,
                error: 'Token CSRF inválido o faltante',
                message: 'No se pudo verificar la autenticidad de la solicitud'
            });
        }
        next(error);
    }
};

/**
 * Middleware para excepciones (rutas públicas que no necesitan CSRF)
 */
const skipCsrfFor = (paths) => {
    return (req, res, next) => {
        const shouldSkip = paths.some(path => {
            if (path.endsWith('*')) {
                const basePath = path.slice(0, -1);
                return req.path.startsWith(basePath);
            }
            return req.path === path;
        });
        
        if (shouldSkip) {
            return next();
        }
        return validateCsrf(req, res, next);
    };
};

/**
 * Función para obtener token CSRF (para APIs)
 */
const getCsrfToken = (req, res) => {
    return generateToken(req, res);
};

/**
 * Middleware para inyectar token en respuestas JSON
 */
const injectCsrfToken = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Solo inyectar token si es una respuesta exitosa y no es una respuesta de error CSRF
        if (data && typeof data === 'object' && data.success !== false && !data.error) {
            try {
                data.csrfToken = generateToken(req, res);
            } catch (error) {
                // Silenciar error en desarrollo
                if (process.env.NODE_ENV !== 'production') {
                    data.csrfToken = 'dev-csrf-token-' + Date.now();
                }
            }
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

/**
 * Rutas que no requieren protección CSRF
 */
const PUBLIC_PATHS = [
    '/api/products', // GET requests
    '/api/products/*', // GET para detalles
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/webhook/*' // Webhooks externos
];

module.exports = {
    generateToken: csrfTokenMiddleware,
    validateCsrf,
    manualCsrfValidation,
    skipCsrfFor,
    getCsrfToken,
    injectCsrfToken,
    doubleCsrfProtection: skipCsrfFor(PUBLIC_PATHS),
    csrfOptions
};