/**
 * Middleware simplificado para CSRF (versión temporal para desarrollo)
 * En producción, se debe usar una implementación robusta como csurf o csrf-csrf
 */

// Middleware para generar token CSRF simulado (para desarrollo)
const csrfTokenMiddleware = (req, res, next) => {
    try {
        // Generar token CSRF simulado para desarrollo
        const token = 'dev-csrf-token-' + Date.now();
        
        // Agregar token a locals para las vistas
        res.locals.csrfToken = token;
        
        // También agregar como variable global para JavaScript
        res.locals.csrfTokenForJS = token;
        
        next();
    } catch (error) {
        console.error("Error generando token CSRF:", error);
        next(error);
    }
};

// Middleware de validación CSRF (siempre pasa en desarrollo)
const validateCsrf = (req, res, next) => {
    // En desarrollo, permitimos todas las solicitudes
    // En producción, se debe implementar validación real
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ CSRF validation disabled in production - implement proper validation');
    }
    next();
};

// Función para obtener token CSRF (para APIs)
const getCsrfToken = (req, res) => {
    return 'dev-csrf-token-' + Date.now();
};

// Middleware para inyectar token en respuestas JSON
const injectCsrfToken = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Solo inyectar token si es una respuesta exitosa
        if (data && typeof data === 'object' && data.success !== false) {
            data.csrfToken = 'dev-csrf-token-' + Date.now();
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

module.exports = {
    generateToken: csrfTokenMiddleware,
    validateCsrf,
    getCsrfToken,
    injectCsrfToken,
    doubleCsrfProtection: validateCsrf // Alias para compatibilidad
};