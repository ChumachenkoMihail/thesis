const {Router} = require('express');
const router = Router();
const bodyParser = require('body-parser');
const queries = require('../queries');

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
    queries.insertUserToDB(surname, name, lastname, email, phone, pass);
    res.send('all is okay');

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
    queries.checkUser(login, password);
    res.send('all is ok from login');
    })
)
module.exports = router;