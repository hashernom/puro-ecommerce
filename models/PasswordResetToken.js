/**
 * Modelo para tokens de recuperación de contraseña
 */

const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
    const PasswordResetToken = sequelize.define('PasswordResetToken', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE'
        },
        token: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'password_reset_tokens',
        indexes: [
            { fields: ['token'] },
            { fields: ['user_id'] },
            { fields: ['expires_at'] }
        ],
        hooks: {
            beforeCreate: (token) => {
                if (!token.token) {
                    token.token = crypto.randomBytes(32).toString('hex');
                }
                if (!token.expires_at) {
                    const expires = new Date();
                    expires.setHours(expires.getHours() + 1); // Expira en 1 hora
                    token.expires_at = expires;
                }
            }
        }
    });

    PasswordResetToken.associate = function(models) {
        PasswordResetToken.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    /**
     * Generar un nuevo token para un usuario
     */
    PasswordResetToken.generateToken = async function(userId) {
        // Invalidar tokens anteriores del usuario
        await this.update(
            { used: true },
            { where: { user_id: userId, used: false } }
        );

        // Crear nuevo token
        return await this.create({ user_id: userId });
    };

    /**
     * Validar un token
     */
    PasswordResetToken.validateToken = async function(token) {
        const resetToken = await this.findOne({
            where: { token, used: false },
            include: [{ model: sequelize.models.User, as: 'user' }]
        });

        if (!resetToken) {
            return { valid: false, message: 'Token no válido o ya utilizado' };
        }

        if (new Date() > resetToken.expires_at) {
            await resetToken.update({ used: true });
            return { valid: false, message: 'Token expirado' };
        }

        return { valid: true, resetToken };
    };

    /**
     * Marcar token como usado
     */
    PasswordResetToken.prototype.markAsUsed = async function() {
        return await this.update({ used: true });
    };

    return PasswordResetToken;
};