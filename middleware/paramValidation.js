/**
 * Middleware para validación segura de parámetros de ruta
 * Previene inyección SQL y type confusion attacks
 */

const { param, validationResult } = require('express-validator');

/**
 * Validación para IDs numéricos
 */
const validateIdParam = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero positivo')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }
        next();
    }
];

/**
 * Validación para IDs opcionales (para rutas como /product/:id?)
 */
const validateOptionalIdParam = [
    param('id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero positivo')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }
        next();
    }
];

/**
 * Validación para tokens (ej: reset password)
 */
const validateTokenParam = [
    param('token')
        .isLength({ min: 64, max: 256 })
        .withMessage('Token inválido')
        .matches(/^[a-zA-Z0-9\-_]+$/)
        .withMessage('Token contiene caracteres inválidos'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }
        next();
    }
];

/**
 * Middleware para validar que un parámetro es numérico
 * Útil para queries como page, limit, etc.
 */
const validateNumericParam = (paramName, options = {}) => {
    const { min = 1, max = 999999, optional = false } = options;
    
    const validator = param(paramName);
    
    if (optional) {
        validator.optional();
    }
    
    validator
        .isInt({ min, max })
        .withMessage(`${paramName} debe ser un número entre ${min} y ${max}`)
        .toInt();
    
    return [
        validator,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => err.msg)
                });
            }
            next();
        }
    ];
};

/**
 * Función helper para validar IDs en controladores
 */
const validateId = (id) => {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId < 1) {
        throw new Error('ID inválido');
    }
    return numId;
};

/**
 * Middleware de validación global para todas las rutas con :id
 */
const globalIdValidation = (req, res, next) => {
    // Solo validar si hay un parámetro 'id' en la ruta
    if (req.params.id && req.params.id !== 'catalog' && req.params.id !== 'api') {
        try {
            const validatedId = validateId(req.params.id);
            req.params.id = validatedId; // Reemplazar con el valor validado
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'ID de parámetro inválido',
                message: 'El ID debe ser un número entero positivo'
            });
        }
    }
    next();
};

module.exports = {
    validateIdParam,
    validateOptionalIdParam,
    validateTokenParam,
    validateNumericParam,
    validateId,
    globalIdValidation
};