const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const Counter = sequelize.define('counter', {
    counter_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    personal_account_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_value:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    service_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{});

module.exports = Counter;