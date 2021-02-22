const mysql = require('mysql2');

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

var database = new Database('localhost', 'root', 'thesis', '1111');

module.exports = database;