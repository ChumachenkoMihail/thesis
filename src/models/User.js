const sequelize = require('./db-singleton');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user',{
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    personal_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
},{
    timestamps: false
});

sequelize.sync().then((result)=>{
    //console.log(result);
});

module.exports = User;