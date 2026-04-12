const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        email: {
            type: DataTypes.STRING, allowNull: false, unique: true,
            validate: { isEmail: true }
        },
        password: {
            type: DataTypes.STRING, allowNull: false,
            validate: { len: [6, 255] }
        },
        first_name: {
            type: DataTypes.STRING(100), allowNull: false,
            validate: { len: [2, 100] }
        },
        last_name: {
            type: DataTypes.STRING(100), allowNull: false,
            validate: { len: [2, 100] }
        },
        role: { type: DataTypes.ENUM('client', 'admin'), defaultValue: 'client' }
    }, {
        tableName: 'users',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) user.password = await bcrypt.hash(user.password, 10);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
            }
        }
    });

    User.prototype.validatePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };
    User.prototype.getFullName = function() {
        return `${this.first_name} ${this.last_name}`;
    };
    User.prototype.getSafeData = function() {
        const { password, ...safeData } = this.toJSON();
        return safeData;
    };

    return User;
};
