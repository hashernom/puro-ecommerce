const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
            type: DataTypes.INTEGER, allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2), allowNull: false,
            validate: { min: 0 }
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
            defaultValue: 'pending'
        },
        shipping_address: { type: DataTypes.TEXT, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'orders',
        indexes: [{ fields: ['user_id'] }, { fields: ['status'] }, { fields: ['created_at'] }]
    });

    Order.prototype.getFormattedTotal = function() {
        return `$${parseFloat(this.total_amount).toFixed(2)}`;
    };
    Order.prototype.getStatusInSpanish = function() {
        const map = { pending: 'Pendiente', processing: 'Procesando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
        return map[this.status] || this.status;
    };
    Order.prototype.canBeCancelled = function() {
        return ['pending', 'processing'].includes(this.status);
    };

    return Order;
};
