const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('first_name').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('El nombre solo puede contener letras'),
    body('last_name').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('El apellido solo puede contener letras'),
    body('email').trim().isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Debe contener mayúscula, minúscula y número'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Las contraseñas no coinciden');
        return true;
    })
];

const validateLogin = [
    body('email').trim().isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida')
];

const validateProduct = [
    body('name').trim().isLength({ min: 3, max: 255 }).withMessage('Nombre debe tener entre 3 y 255 caracteres'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descripción no puede exceder 1000 caracteres'),
    body('price').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser entero >= 0'),
    body('image_url').optional().isURL().withMessage('URL de imagen inválida')
];

const validateProductUpdate = [
    body('name').optional().trim().isLength({ min: 3, max: 255 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('price').optional().isFloat({ min: 0.01 }),
    body('stock').optional().isInt({ min: 0 }),
    body('image_url').optional().isURL(),
    body('is_active').optional().isBoolean()
];

const validateOrder = [
    body('shipping_address').trim().isLength({ min: 10, max: 500 }).withMessage('Dirección debe tener entre 10 y 500 caracteres'),
    body('notes').optional().trim().isLength({ max: 1000 })
];

const validateAddToCart = [
    body('productId').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('quantity').optional().isInt({ min: 1, max: 999 })
];

const validateUpdateCart = [
    body('quantity').isInt({ min: 0, max: 999 })
];

const validateForgotPassword = [
    body('email').trim().isEmail().withMessage('Debe ser un email válido').normalizeEmail()
];

const validateResetPassword = [
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Debe contener mayúscula, minúscula y número'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Las contraseñas no coinciden');
        return true;
    })
];

const validateOrderStatus = [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Estado de pedido inválido')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { req.validationErrors = errors.array(); }
    next();
};

module.exports = {
    validateRegister, validateLogin, validateProduct, validateProductUpdate,
    validateOrder, validateAddToCart, validateUpdateCart, validateOrderStatus,
    validateForgotPassword, validateResetPassword,
    handleValidationErrors
};
