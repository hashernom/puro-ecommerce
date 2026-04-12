/**
 * Controlador para recuperación de contraseña
 */

const { User, PasswordResetToken } = require('../models');
const { sendPasswordResetEmail } = require('../config/email');
const { validationResult } = require('express-validator');

class PasswordResetController {
    
    /**
     * Mostrar formulario para solicitar recuperación
     */
    static showForgotPassword(req, res) {
        res.render('auth/forgot-password', {
            title: 'Recuperar contraseña - PURO',
            errors: req.validationErrors || [],
            success: req.query.success === 'true',
            formData: {}
        });
    }
    
    /**
     * Procesar solicitud de recuperación
     */
    static async processForgotPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('auth/forgot-password', {
                    title: 'Recuperar contraseña - PURO',
                    errors: errors.array(),
                    formData: { email: req.body.email }
                });
            }
            
            const { email } = req.body;
            
            // Buscar usuario
            const user = await User.findOne({ where: { email } });
            
            // Por seguridad, siempre mostrar éxito aunque el email no exista
            if (!user) {
                console.log(`⚠️  Intento de recuperación para email no registrado: ${email}`);
                return res.redirect('/auth/forgot-password?success=true');
            }
            
            // Generar token
            const resetToken = await PasswordResetToken.generateToken(user.id);
            
            // Enviar email
            const emailSent = await sendPasswordResetEmail(email, resetToken.token);
            
            if (!emailSent) {
                return res.render('auth/forgot-password', {
                    title: 'Recuperar contraseña - PURO',
                    errors: [{ msg: 'Error al enviar el email. Intenta nuevamente.' }],
                    formData: { email }
                });
            }
            
            res.redirect('/auth/forgot-password?success=true');
            
        } catch (error) {
            console.error('Error en processForgotPassword:', error);
            res.render('auth/forgot-password', {
                title: 'Recuperar contraseña - PURO',
                errors: [{ msg: 'Error del servidor. Intenta nuevamente.' }],
                formData: { email: req.body.email }
            });
        }
    }
    
    /**
     * Mostrar formulario para restablecer contraseña
     */
    static async showResetPassword(req, res) {
        const { token } = req.query;
        
        if (!token) {
            return res.redirect('/auth/forgot-password');
        }
        
        // Validar token
        const validation = await PasswordResetToken.validateToken(token);
        
        if (!validation.valid) {
            return res.render('auth/reset-password', {
                title: 'Restablecer contraseña - PURO',
                token,
                errors: [{ msg: validation.message }],
                formData: {}
            });
        }
        
        res.render('auth/reset-password', {
            title: 'Restablecer contraseña - PURO',
            token,
            errors: req.validationErrors || [],
            formData: {}
        });
    }
    
    /**
     * Procesar restablecimiento de contraseña
     */
    static async processResetPassword(req, res) {
        try {
            const errors = validationResult(req);
            const { token, password, confirm_password } = req.body;
            
            if (!token) {
                return res.redirect('/auth/forgot-password');
            }
            
            // Validar token
            const validation = await PasswordResetToken.validateToken(token);
            
            if (!validation.valid) {
                return res.render('auth/reset-password', {
                    title: 'Restablecer contraseña - PURO',
                    token,
                    errors: [{ msg: validation.message }],
                    formData: {}
                });
            }
            
            // Validar contraseñas
            if (errors.isEmpty()) {
                if (password !== confirm_password) {
                    errors.errors.push({ msg: 'Las contraseñas no coinciden' });
                }
            }
            
            if (!errors.isEmpty()) {
                return res.render('auth/reset-password', {
                    title: 'Restablecer contraseña - PURO',
                    token,
                    errors: errors.array(),
                    formData: { password, confirm_password }
                });
            }
            
            // Actualizar contraseña del usuario
            const user = validation.resetToken.user;
            user.password = password;
            await user.save();
            
            // Marcar token como usado
            await validation.resetToken.markAsUsed();
            
            // Redirigir a login con mensaje de éxito
            req.session.successMessage = 'Contraseña restablecida correctamente. Inicia sesión con tu nueva contraseña.';
            res.redirect('/auth/login');
            
        } catch (error) {
            console.error('Error en processResetPassword:', error);
            res.render('auth/reset-password', {
                title: 'Restablecer contraseña - PURO',
                token: req.body.token,
                errors: [{ msg: 'Error del servidor. Intenta nuevamente.' }],
                formData: { password: req.body.password, confirm_password: req.body.confirm_password }
            });
        }
    }
}

module.exports = PasswordResetController;