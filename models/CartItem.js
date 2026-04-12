/**
 * Modelo para persistir carrito en base de datos
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CartItem = sequelize.define('CartItem', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE'
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'products', key: 'id' },
            onDelete: 'CASCADE'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: { min: 1 }
        },
        added_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'cart_items',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['product_id'] },
            { unique: true, fields: ['user_id', 'product_id'] }
        ],
        hooks: {
            beforeCreate: (cartItem) => {
                if (!cartItem.added_at) {
                    cartItem.added_at = new Date();
                }
            }
        }
    });

    CartItem.associate = function(models) {
        CartItem.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE'
        });
        
        CartItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product',
            onDelete: 'CASCADE'
        });
    };

    /**
     * Obtener carrito completo de un usuario
     */
    CartItem.getUserCart = async function(userId) {
        return await this.findAll({
            where: { user_id: userId },
            include: [
                { 
                    model: sequelize.models.Product, 
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'stock', 'image_url', 'is_active']
                }
            ],
            order: [['added_at', 'DESC']]
        });
    };

    /**
     * Agregar o actualizar producto en carrito
     */
    CartItem.addOrUpdate = async function(userId, productId, quantity = 1) {
        const [cartItem, created] = await this.findOrCreate({
            where: { user_id: userId, product_id: productId },
            defaults: { quantity }
        });

        if (!created) {
            cartItem.quantity = quantity;
            await cartItem.save();
        }

        return cartItem;
    };

    /**
     * Eliminar producto del carrito
     */
    CartItem.removeFromCart = async function(userId, productId) {
        return await this.destroy({
            where: { user_id: userId, product_id: productId }
        });
    };

    /**
     * Vaciar carrito de usuario
     */
    CartItem.clearUserCart = async function(userId) {
        return await this.destroy({
            where: { user_id: userId }
        });
    };

    /**
     * Sincronizar carrito de sesión con base de datos
     */
    CartItem.syncSessionCart = async function(userId, sessionCartItems) {
        // Primero vaciar carrito actual
        await this.clearUserCart(userId);
        
        // Luego agregar items de sesión
        for (const item of sessionCartItems) {
            await this.create({
                user_id: userId,
                product_id: item.productId,
                quantity: item.quantity
            });
        }
    };

    return CartItem;
};