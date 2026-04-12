const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderDetail = sequelize.define('OrderDetail', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        order_id: {
            type: DataTypes.INTEGER, allowNull: false,
            references: { model: 'orders', key: 'id' }
        },
        product_id: {
            type: DataTypes.INTEGER, allowNull: false,
            references: { model: 'products', key: 'id' }
        },
        quantity: {
            type: DataTypes.INTEGER, allowNull: false,
            validate: { min: 1 }
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2), allowNull: false,
            validate: { min: 0 }
        },
        subtotal: {
            type: DataTypes.VIRTUAL,
            get() { return parseFloat(this.quantity * this.unit_price).toFixed(2); }
        }
    }, {
        tableName: 'order_details',
        indexes: [{ fields: ['order_id'] }, { fields: ['product_id'] }]
    });

    OrderDetail.prototype.getFormattedSubtotal = function() { return `$${this.subtotal}`; };
    OrderDetail.prototype.getFormattedUnitPrice = function() { return `$${parseFloat(this.unit_price).toFixed(2)}`; };

    return OrderDetail;
};
