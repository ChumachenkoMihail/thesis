const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Services = sequelize.define('services', {
    service_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    service_type:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rate:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type_of_accrual:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Services;