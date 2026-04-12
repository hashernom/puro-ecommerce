const { User } = require('../models');
const { validationResult } = require('express-validator');

class AuthController {
    static showLogin(req, res) {
        res.render('auth/login', {
            title: 'Iniciar Sesión - PURO',
            errors: req.validationErrors || [],
            formData: {}
        });
    }

    static async processLogin(req, res) {
        const { email, password } = req.body;
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('auth/login', { title: 'Iniciar Sesión - PURO', errors: errors.array(), formData: { email } });
            }
            const user = await User.findOne({ where: { email } });
            if (!user || !(await user.validatePassword(password))) {
                return res.render('auth/login', { title: 'Iniciar Sesión - PURO', errors: [{ msg: 'Email o contraseña incorrectos' }], formData: { email } });
            }
            req.session.user = user.getSafeData();
            req.session.save((err) => {
                if (err) {
                    return res.render('auth/login', { title: 'Iniciar Sesión - PURO', errors: [{ msg: 'Error del sistema.' }], formData: { email } });
                }
                const redirectUrl = req.session.redirectUrl || (user.role === 'admin' ? '/admin/dashboard' : '/');
                delete req.session.redirectUrl;
                res.redirect(redirectUrl);
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.render('auth/login', { title: 'Iniciar Sesión - PURO', errors: [{ msg: 'Error del servidor.' }], formData: { email } });
        }
    }

    static showRegister(req, res) {
        res.render('auth/register', { title: 'Registrarse - PURO', errors: req.validationErrors || [], formData: {} });
    }

    static async processRegister(req, res) {
        const { first_name, last_name, email, password } = req.body;
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('auth/register', { title: 'Registrarse', errors: errors.array(), formData: { first_name, last_name, email } });
            }
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.render('auth/register', { title: 'Registrarse', errors: [{ msg: 'Este email ya está registrado' }], formData: { first_name, last_name, email } });
            }
            const newUser = await User.create({ first_name, last_name, email, password, role: 'client' });
            req.session.user = newUser.getSafeData();
            res.redirect('/');
        } catch (error) {
            console.error('Error en registro:', error);
            let msg = 'Error del servidor.';
            if (error.name === 'SequelizeUniqueConstraintError') msg = 'Este email ya está registrado';
            res.render('auth/register', { title: 'Registrarse', errors: [{ msg }], formData: { first_name, last_name, email } });
        }
    }

    static logout(req, res) {
        req.session.destroy((err) => { res.redirect('/'); });
    }

    static showProfile(req, res) {
        res.render('auth/profile', { title: 'Mi Perfil', user: req.session.user });
    }

    static async updateProfile(req, res) {
        const { first_name, last_name, current_password, new_password } = req.body;
        try {
            const user = await User.findByPk(req.session.user.id);
            user.first_name = first_name;
            user.last_name = last_name;
            if (new_password) {
                if (!current_password) return res.render('auth/profile', { title: 'Mi Perfil', user: req.session.user, errors: [{ msg: 'Debes ingresar tu contraseña actual' }] });
                if (!(await user.validatePassword(current_password))) return res.render('auth/profile', { title: 'Mi Perfil', user: req.session.user, errors: [{ msg: 'Contraseña actual incorrecta' }] });
                user.password = new_password;
            }
            await user.save();
            req.session.user = user.getSafeData();
            res.render('auth/profile', { title: 'Mi Perfil', user: req.session.user, success: 'Perfil actualizado correctamente' });
        } catch (error) {
            res.render('auth/profile', { title: 'Mi Perfil', user: req.session.user, errors: [{ msg: 'Error del servidor.' }] });
        }
    }
}

module.exports = AuthController;
