const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Payment = sequelize.define('payment', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    counter_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date:{
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    amount_paid:{
        type: DataTypes.FLOAT,
        allowNull: false
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Payment;