const {Router} = require('express');
const router = Router();
const bodyParser = require('body-parser');
const queries = require('../queries');
const database = require('../classes/Database');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const salt = 10;


var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (req,res)=>{
    res.render('index.hbs',{
        title : 'Коммунальные услуги'
    });

});

router.get('/registration', (req,res) =>{
    res.render('registration.hbs',{
        title : 'Регистрация'
    });
});

router.post('/registration', urlencodedParser, (req,res)=>{
    if(!req.body)
        return res.sendStatus(400);
    let surname = req.body.userSurname.toString();
    let name = req.body.userName.toString();
    let lastname = req.body.userLastName.toString();
    let email =req.body.userEmail.toString();
    let pass = req.body.userPass.toString();
    let phone = req.body.userPhone.toString();

    pass = bcrypt.hashSync(pass, salt);
    User.create({
        surname: surname,
        name: name,
        lastname: lastname,
        login: email,
        password: pass,
        email: email,
        telephone: phone,
        personal_account_id: 1
    }).then(res=>{
        console.log("Registration Succesfully!");
    }).catch(err=>{
        console.log(err);
    })
    //res.send('all is okay');
    res.redirect('/');
})

router.get('/account' ,(req,res) =>{
    res.render('account.hbs',{
    });
});

router.get('/signup', (req,res)=>{
    res.render('signup.hbs',{
        title : 'Войти'
    })

})

router.post('/signup', urlencodedParser, ((req, res) => {
    if(!req.body)
        return res.sendStatus(400);
    let login = req.body.login.toString();
    let password = req.body.password.toString();

    User.findOne({where:{
        login: login
        //password: password
        }, raw: true}).then(findedUsers=>{
            if(findedUsers) {
                console.log(findedUsers);
                bcrypt.hash(req.body.password, salt).then(hash => {
                    console.log(hash);
                    console.log(req.body.password);
                    console.log(req.body.password.toString());
                    bcrypt.compare(req.body.password, findedUsers.password, function (err, result){
                        if(result){
                            console.log("Auth succesful!");
                            return findedUsers;
                        }
                        else
                            console.log('No User with this values1');
                    })
                })
            }
            else
                console.log('No User with this values');
    }).catch(err=>{
        console.log(err);
    })
    console.log("From auth");
    //res.send('all is ok from login');
    res.redirect('/');
    })
)
module.exports = router;