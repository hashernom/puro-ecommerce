const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const PasswordResetController = require('../controllers/passwordResetController');
const { requireAuth, requireGuest } = require('../middleware/auth');
const {
    validateLogin, validateRegister, validateForgotPassword, validateResetPassword,
    handleValidationErrors
} = require('../middleware/validation');

// Login
router.get('/login', requireGuest, AuthController.showLogin);
router.post('/login', requireGuest, validateLogin, handleValidationErrors, AuthController.processLogin);

// Registro
router.get('/register', requireGuest, AuthController.showRegister);
router.post('/register', requireGuest, validateRegister, handleValidationErrors, AuthController.processRegister);

// Logout
router.post('/logout', AuthController.logout);

// Perfil
router.get('/profile', requireAuth, AuthController.showProfile);
router.post('/profile', requireAuth, AuthController.updateProfile);

// Recuperación de contraseña
router.get('/forgot-password', requireGuest, PasswordResetController.showForgotPassword);
router.post('/forgot-password', requireGuest, validateForgotPassword, handleValidationErrors, PasswordResetController.processForgotPassword);

router.get('/reset-password', requireGuest, PasswordResetController.showResetPassword);
router.post('/reset-password', requireGuest, validateResetPassword, handleValidationErrors, PasswordResetController.processResetPassword);

module.exports = router;
