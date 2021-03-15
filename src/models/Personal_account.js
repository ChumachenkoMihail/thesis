const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Personal_account = sequelize.define('personal_account',{
    personal_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    house: {
        type: DataTypes.STRING,
        allowNull: false
    },
    flat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    square: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    heated_square: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    count_of_tenants: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Personal_account;