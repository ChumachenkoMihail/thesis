const {Router} = require('express');
const router = Router();
const bodyParser = require('body-parser');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const cookie_parser = require('cookie-parser');
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
    const {userSurname, userName,userLastName, userEmail, userPass, userPhone} = req.body;
    let hashed_pass = bcrypt.hashSync(userPass, salt);
    User.create({
        surname: userSurname,
        name: userName,
        lastname: userLastName,
        login: userEmail,
        password: hashed_pass,
        email: userEmail,
        telephone: userPhone,
        personal_account_id: 1
    }).then(res=>{
        console.log("Registration Successfully!");
    }).catch(err=>{
        console.log(err);
    })
    res.redirect('/signin');
})

router.get('/signin', (req,res)=>{
    res.render('signin.hbs',{
        title : 'Войти'
    })
})

router.get('/about',(req,res)=>{
    res.render('about.hbs',{
        title: 'О компании'
    })
})

router.get('/personal',(req,res)=>{
    if(req.cookies.auth === 'true'){
        User.findOne({where:{
            user_id: req.cookies.user_id
            }}).then(foundUser =>{
                res.render('personal.hbs',{
                    title: 'Личный кабинет',
                    fullName: `${foundUser.name} ${foundUser.surname} ${foundUser.lastname}`
                })
        }).catch(err=>{
            console.log(err);
        })
    }
    else {
        res.redirect('/signin');
        alert('Something going wrong!');
    }


})

router.post('/signin', urlencodedParser, ((req, res) => {
    if(!req.body)
        return res.sendStatus(400);
    let login = req.body.login.toString();
    let password = req.body.password.toString();

    User.findOne({where:{
        login: login
        //password: password
        }, raw: true}).then(foundUser=>{
            if(foundUser) {
                console.log('Authenticated');
                res.cookie('auth', 'true');
                res.cookie('user_id', foundUser.user_id)
                return res.redirect('/personal');
            }
            else
                res.redirect('/signin');
                console.log('No User with this values');
    }).catch(err=>{
        console.log(err);
    })
    })
)

module.exports = router;