/**
 * Middleware de validación global
 * Valida tipos de datos básicos y sanitiza entradas
 */

const { body, query, param, validationResult } = require('express-validator');

/**
 * Sanitización básica para prevenir XSS
 */
const sanitizeInput = (req, res, next) => {
    // Sanitizar body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Escapar caracteres HTML básicos
                req.body[key] = req.body[key]
                    .replace(/</g, '<')
                    .replace(/>/g, '>')
                    .replace(/"/g, '"')
                    .replace(/'/g, '&#x27;');
            }
        });
    }
    
    // Sanitizar query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key]
                    .replace(/</g, '<')
                    .replace(/>/g, '>');
            }
        });
    }
    
    next();
};

/**
 * Validación global para números enteros positivos
 */
const validatePositiveInt = (field, source = 'body') => {
    const validator = source === 'body' ? body : source === 'query' ? query : param;
    return [
        validator(field)
            .isInt({ min: 1 })
            .withMessage(`${field} debe ser un número entero positivo`)
            .toInt(),
        handleValidationErrors
    ];
};

/**
 * Validación global para emails
 */
const validateEmail = (field = 'email') => {
    return [
        body(field)
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),
        handleValidationErrors
    ];
};

/**
 * Validación global para strings con longitud mínima
 */
const validateString = (field, minLength = 1, maxLength = 255) => {
    return [
        body(field)
            .trim()
            .isLength({ min: minLength, max: maxLength })
            .withMessage(`${field} debe tener entre ${minLength} y ${maxLength} caracteres`),
        handleValidationErrors
    ];
};

/**
 * Validación global para precios (decimales positivos)
 */
const validatePrice = (field = 'price') => {
    return [
        body(field)
            .isFloat({ min: 0 })
            .withMessage(`${field} debe ser un número positivo`)
            .toFloat(),
        handleValidationErrors
    ];
};

/**
 * Manejador de errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

/**
 * Middleware para validar que el body no esté vacío en POST/PUT
 */
const validateNotEmptyBody = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El cuerpo de la solicitud no puede estar vacío'
            });
        }
    }
    next();
};

/**
 * Validación para IDs en rutas (alias para compatibilidad)
 */
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero positivo')
        .toInt(),
    handleValidationErrors
];

/**
 * Middleware global que aplica sanitización básica a todas las rutas
 */
const globalSanitization = (req, res, next) => {
    // Solo aplicar sanitización a métodos que reciben datos
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        sanitizeInput(req, res, next);
    } else {
        next();
    }
};

module.exports = {
    sanitizeInput,
    validatePositiveInt,
    validateEmail,
    validateString,
    validatePrice,
    handleValidationErrors,
    validateNotEmptyBody,
    validateId,
    globalSanitization,
    
    // Exportar validaciones comunes preconfiguradas
    commonValidations: {
        product: [
            validateString('name', 3, 100),
            validatePrice('price'),
            validatePositiveInt('stock', 'body')
        ],
        user: [
            validateEmail(),
            validateString('password', 6, 100),
            validateString('first_name', 2, 50),
            validateString('last_name', 2, 50)
        ],
        order: [
            validatePositiveInt('user_id', 'body'),
            validatePrice('total_amount')
        ]
    }
};