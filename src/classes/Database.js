/*const mysql = require('mysql2');
const db = require('../../config');

class Database{

    constructor(host,user,database, password){
        this.connection = mysql.createConnection({
            host,
            user,
            database,
            password
        });

        this.connection.connect(err => {
            if(err) console.log(`Connection error by" ${err.message}`);
            else console.log(`DB Connection successful`);
        });
    }

    makeQuery(query,callback) {
        this.connection.query(query, (err, result) => {
            if(err)
                console.log('query error!!!' + err.message);
            callback(result);
        });

    }

    closeConnection(err) {
        if (err)
            console.log(`Connection error by ${err.message}`);
        else{
            this.connection.end();
            console.log(`End connection successful`);}
    }
}

const database = new Database(db.DATABASE_CONFIG.HOST, db.DATABASE_CONFIG.USER, db.DATABASE_CONFIG.DATABASE_NAME, db.DATABASE_CONFIG.PASSWORD);

module.exports = database;*/
const db = require('../../config');
const bcrypt = require('bcrypt');
const salt = 10;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(db.DATABASE_CONFIG.DATABASE_NAME, db.DATABASE_CONFIG.USER, db.DATABASE_CONFIG.PASSWORD, {
    dialect: 'mysql',
    host: 'localhost'
});

const User = sequelize.define('user',{
    user_id: {
        type: DataTypes.STRING,
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
    console.log(result);
});


function insertUser(surname, name, lastname, email, phone, password){
    password = bcrypt.hashSync(password, salt);
    User.create({
        surname: surname,
        name: name,
        lastname: lastname,
        login: email,
        password: password,
        email: email,
        telephone: phone,
        personal_account_id: 1
    }).then(res=>{
        console.log(res);
    }).catch(err=>{
        console.log(err);
    })
}

function selectUser(login,password){
    password = bcrypt.hashSync(password, salt);
    const selectUser = User.findAll({where:{
        login: login,
        password: password
      }, raw: true}).then(res=>{
          console.log(res);
          return res;
  }).catch(err=>{
      console.log(err);
  })
}

module.exports.selectUser = selectUser;
module.exports.insertUser = insertUser;