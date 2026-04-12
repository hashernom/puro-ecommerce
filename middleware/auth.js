const { User } = require('../models');

const requireAuth = (req, res, next) => {
    if (req.session.user) { next(); }
    else {
        req.session.redirectUrl = req.originalUrl;
        res.redirect('/auth/login');
    }
};

const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') { next(); }
    else {
        res.status(403).render('error', {
            title: 'Acceso Denegado',
            message: 'No tienes permisos para acceder a esta página.',
            statusCode: 403
        });
    }
};

const requireGuest = (req, res, next) => {
    if (req.session.user) res.redirect('/');
    else next();
};

const loadUser = async (req, res, next) => {
    if (req.session.user) {
        try {
            const user = await User.findByPk(req.session.user.id);
            if (user) { req.user = user; res.locals.user = user.getSafeData(); }
            else { req.session.destroy(); res.locals.user = null; }
        } catch (error) {
            console.error('Error loading user:', error);
            res.locals.user = null;
        }
    }
    next();
};

module.exports = { requireAuth, requireAdmin, requireGuest, loadUser };
