const {Router} = require('express');
const router = Router();

const User = require('../models/User');
const Accruals = require('../models/Accruals');
const Services = require('../models/Services');
const Personal_account = require('../models/Personal_account');
const Tenants = require('../models/Tenants');
const Payment = require('../models/Payment');
const Counter = require('../models/Counter');

const bcrypt = require('bcrypt');
const salt = 10;



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

router.post('/registration', (req,res)=>{
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

router.post('/signin', ((req, res) => {
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

router.get('/logout',(req,res)=>{
    res.clearCookie('auth');
    res.redirect('/');
})

router.get('/personal',(req,res)=>{
    if(req.cookies.auth === 'true'){
        User.findOne({where:{
                user_id: req.cookies.user_id
            }}).then(foundUser =>{
                Personal_account.findOne({where:{
                    personal_account_id: req.cookies.user_id
                    }}).then(foundAccount =>{
                    res.render('personal.hbs',{
                        title: 'Личный кабинет',
                        fullName: `${foundUser.surname} ${foundUser.name} ${foundUser.lastname}`,
                        street: `${foundAccount.street}`,
                        house: `${foundAccount.house}`,
                        flat: `${foundAccount.flat}`
                })
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

router.get('/enter', (req,res)=>{
    if(req.cookies.auth === 'true'){
        res.render('enter.hbs',{
            title: 'Внести показания'
        })
    }
    else{
        res.redirect('/signin');
        alert('Something going wrong!');
    }
})


router.post('/enter' ,(req, res) => {
    if(!req.body) return res.sendStatus(400);

    const {electro, gas, water, heating} = req.body;
    let electro_rate, gas_rate, water_rate, heating_rate;

    let today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth()+1);
    let yyyy = String(today.getFullYear());
    let data = dd + '.' + mm + '.' + yyyy;
    if(electro) {
        Services.findOne({
            where: {
                service_id: 1
            }
        }).then(found_service => {
            electro_rate = found_service.rate;
            let to_pay = electro * electro_rate;

            Accruals.create({
                personal_account_id: req.cookies.user_id,
                service_id: 1,
                data: data,
                counter_value: electro,
                amount_to_pay: to_pay
            }).catch(err => {
                console.log(err);
            });

        }).catch(console.log);
    }

    if(gas){
        Services.findOne({
            where:{
                service_id: 2
            }
        }).then(found_service => {
            gas_rate = found_service.rate;
            let to_pay = gas * gas_rate;

            Accruals.create({
                personal_account_id: req.cookie.user_id,
                service_id: 2,
                data: data,
                counter_value: gas,
                amount_to_pay: to_pay
            }).catch(console.log)
            }

        ).catch(console.log);
    }

    if(water){
        Services.findOne({
            where:{
                service_id: 4
            }
        }).then(found_service => {
                water_rate = found_service.rate;
                let to_pay = water * water_rate;

                Accruals.create({
                    personal_account_id: req.cookie.user_id,
                    service_id: 4,
                    data: data,
                    counter_value: water,
                    amount_to_pay: to_pay
                }).catch(console.log)
            }

        ).catch(console.log);
    }

    if(heating){
        Services.findOne({
            where:{
                service_id: 5
            }
        }).then(found_service => {
                heating_rate = found_service.rate;
                let to_pay = heating * heating_rate;

                Accruals.create({
                    personal_account_id: req.cookie.user_id,
                    service_id: 5,
                    data: data,
                    counter_value: heating,
                    amount_to_pay: to_pay
                }).catch(console.log)
            }

        ).catch(console.log);
    }
    res.redirect('/personal');

})

router.get('/accruals', (req, res) => {
    if(req.cookies.auth === 'true'){
        res.render('accruals.hbs',{
            title: 'Статистика начислений',
        })
    }
    else{
        res.redirect('/signin');
        alert('Something going wrong!');
    }
})

router.get('/ajax',((req, res) => {
        let result;
        Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: req.query.value
            }, raw: true}).then(foundAccruals => {
            result = foundAccruals;
        }).then(()=>{
            res.json(result);
        })
}))

//need to finish this page
router.get('/about',(req,res)=>{
    res.render('about.hbs',{
        title: 'О компании'
    })
})



module.exports = router;