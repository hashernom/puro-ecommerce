const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: {
            type: DataTypes.STRING, allowNull: false, unique: true,
            validate: { len: [3, 255] }
        },
        description: { type: DataTypes.TEXT, allowNull: true },
        price: {
            type: DataTypes.DECIMAL(10, 2), allowNull: false,
            validate: { min: 0.01 }
        },
        stock: {
            type: DataTypes.INTEGER, defaultValue: 0,
            validate: { min: 0 }
        },
        image_url: {
            type: DataTypes.STRING(500), allowNull: true,
            defaultValue: '/images/default-product.jpg'
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: 'natural'
        },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'products',
        indexes: [{ fields: ['name'] }, { fields: ['is_active'] }]
    });

    Product.prototype.isAvailable = function(quantity = 1) {
        return this.is_active && this.stock >= quantity;
    };
    
    Product.prototype.reduceStock = function(quantity) {
        if (this.stock >= quantity) {
            this.stock -= quantity;
            return true;
        }
        return false;
    };
    
    Product.prototype.decrementStock = async function(quantity) {
        if (this.stock >= quantity) {
            this.stock -= quantity;
            await this.save();
            return true;
        }
        return false;
    };
    
    Product.prototype.incrementStock = async function(quantity) {
        this.stock += quantity;
        await this.save();
        return true;
    };
    
    Product.prototype.getFormattedPrice = function() {
        return `$${parseFloat(this.price).toFixed(2)}`;
    };

    return Product;
};
