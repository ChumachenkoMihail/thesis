const mysql = require('mysql2');
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

module.exports = database;