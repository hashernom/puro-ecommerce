const { sequelize } = require('../config/database');

const UserModel = require('./User');
const ProductModel = require('./Product');
const OrderModel = require('./Order');
const OrderDetailModel = require('./OrderDetail');
const PasswordResetTokenModel = require('./PasswordResetToken');
const CartItemModel = require('./CartItem');

const User = UserModel(sequelize);
const Product = ProductModel(sequelize);
const Order = OrderModel(sequelize);
const OrderDetail = OrderDetailModel(sequelize);
const PasswordResetToken = PasswordResetTokenModel(sequelize);
const CartItem = CartItemModel(sequelize);

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'orderDetails', onDelete: 'CASCADE' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderDetail, { foreignKey: 'product_id', as: 'orderDetails', onDelete: 'RESTRICT' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

const db = {
    sequelize,
    User,
    Product,
    Order,
    OrderDetail,
    PasswordResetToken,
    CartItem,
    Cart: require('./Cart')
};

module.exports = db;
