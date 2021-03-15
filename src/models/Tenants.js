const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Tenants = sequelize.define('tenants', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    surname:{
        type: DataTypes.STRING,
        allowNull: false
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname:{
        type: DataTypes.STRING,
        allowNull: false
    },
    percent_of_privileges:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    personal_account_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    }

},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Services;