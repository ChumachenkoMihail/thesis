const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Accruals = sequelize.define('accruals', {
    personal_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    service_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data:{
        type: DataTypes.STRING,
        allowNull: false
    },
    counter_value:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    amount_to_pay:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paid:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Accruals;