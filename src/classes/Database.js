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
        console.log("Registration Succesfully!");
    }).catch(err=>{
        console.log(err);
    })
}