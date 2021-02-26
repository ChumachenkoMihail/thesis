const db = require(__dirname + '/db');
const bcrypt = require('bcrypt');
const salt = 10;


function insertUserToDB(surname, name, lastname, email, phone, password){
    password = bcrypt.hashSync(password, salt);
    let result = db.makeQuery(`INSERT INTO user(surname, name, lastname, login, password, email, telephone)  VALUES ('${surname}','${name}','${lastname}','${email}','${password}','${email}','${phone}')`,(result)=>{
    })
}

function checkUser(login, password){
    password = bcrypt.hashSync(password, salt);
    var res;
    db.makeQuery(`SELECT * FROM user WHERE login = '${login}' AND password = '${password}'`, (result)=> {
            console.log(result);
        }
    );
    console.log('Some results:');
    /*for(let i=0;i<res.length;i++) {
        console.log(res[i].login.toString() + res[i].password.toString() + '\n');
    }*/
}

module.exports.checkUser = checkUser;
module.exports.insertUserToDB = insertUserToDB;