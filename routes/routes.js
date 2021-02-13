const {Router} = require('express');
const router = Router();
const bodyParser = require('body-parser');

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
    console.log(req.body + "\n" + req.body.userName + "\n" + req.body.userSurname + "\n" + req.body.userSecondName);
    res.render('registration.hbs');
})

module.exports = router;