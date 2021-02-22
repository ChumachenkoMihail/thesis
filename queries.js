const db = require(__dirname + '/db');

function selectUserByName (){
        let result = db.makeQuery("SELECT * FROM user", (result)=>{
            console.log(result);
        });

}

function insertUserToDB(surname, name, lastname, email, phone, password){
    let result = db.makeQuery(`INSERT INTO user(surname, name, lastname, login, password, email, telephone)  VALUES ('${surname}','${name}','${lastname}','${email}','${password}','${email}','${phone}')`,(result)=>{
    })
}

module.exports.selectUserByName = selectUserByName;
module.exports.insertUserToDB = insertUserToDB;