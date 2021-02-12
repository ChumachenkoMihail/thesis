const {Router} = require('express');
const router = Router();

router.get('/', (req,res)=>{
    res.render('index.hbs',{
        title : 'Коммунальные услуги'
    });
});

router.get('/registration', (rea,res) =>{
    res.render('registration.hbs',{
        title : 'Регистрация'
    })
})

module.exports = router;