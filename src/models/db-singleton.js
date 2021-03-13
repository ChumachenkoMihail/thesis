const db = require('../../config');
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(db.DATABASE_CONFIG.DATABASE_NAME, db.DATABASE_CONFIG.USER, db.DATABASE_CONFIG.PASSWORD, {
    dialect: 'mysql',
    host: 'localhost',
    port: '3307'
});

module.exports = sequelize;