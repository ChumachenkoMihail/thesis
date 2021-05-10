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
        let electro_start_value = 0, electro_counter_number = "", electro_date = "", electro_last_value = 1;
        let gas_start_value = 0, gas_counter_number = "", gas_date = "", gas_last_value = 1;
        let water_start_value = 0, water_counter_number = "", water_date = "", water_last_value = 1;
        Counter.findOne({
            where: {
                personal_account_id: req.cookies.user_id,
                service_id: 1
            }
        })
            .then(found_counter => {
                if(found_counter) {
                    electro_start_value = found_counter.start_value;
                    electro_counter_number = found_counter.counter_number;
                }
            })
            .then(() => {
                return Accruals.max('counter_value', {
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 1
                    }
                });
            })
            .then(last_accrual_value => {
                return Accruals.findOne({
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 1,
                        counter_value: last_accrual_value
                    }
                })
            })
            .then(last_accrual => {
                if(last_accrual) {
                    electro_date = last_accrual.data;
                    electro_last_value = last_accrual.counter_value;
                }
            })
            .then(()=>{
                return Counter.findOne({
                    where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 4
                    }
                })
            })
            .then(found_water_counter => {
                if(found_water_counter) {
                    water_start_value = found_water_counter.start_value;
                    water_counter_number = found_water_counter.counter_number;
                }
            })
            .then(()=>{
                return Accruals.max('counter_value', {
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 4
                    }
                });
            })
            .then(last_water_accural_value=>{
                return Accruals.findOne({
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 4,
                        counter_value: last_water_accural_value
                    }
                })
            })
            .then(last_water_accrual => {
                if(last_water_accrual) {
                    water_date = last_water_accrual.data;
                    water_last_value = last_water_accrual.counter_value;
                }
            })
            .then(()=>{
                return Counter.findOne({
                    where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 2
                    }
                })
            })
            .then(found_gas_counter => {
                if(found_gas_counter) {
                    gas_start_value = found_gas_counter.start_value;
                    gas_counter_number = found_gas_counter.counter_number;
                }
            })
            .then(()=>{
                return Accruals.max('counter_value', {
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 2
                    }
                });
            })
            .then(last_gas_accural_value=>{
                return Accruals.findOne({
                    where: {
                        personal_account_id: req.cookies.user_id,
                        service_id: 2,
                        counter_value: last_gas_accural_value
                    }
                })
            })
            .then(last_gas_accrual => {
                if(last_gas_accrual) {
                    gas_date = last_gas_accrual.data;
                    gas_last_value = last_gas_accrual.counter_value;
                }
            })
            .then(() => {
                res.render('enter.hbs', {
                    title: 'Внести показания',
                    electro_start_value: electro_start_value,
                    electro_counter_number: electro_counter_number,
                    electro_date: electro_date,
                    electro_last_value: electro_last_value,
                    water_start_value: water_start_value,
                    water_counter_number: water_counter_number,
                    water_date: water_date,
                    water_last_value: water_last_value,
                    gas_start_value: gas_start_value,
                    gas_counter_number: gas_counter_number,
                    gas_date: gas_date,
                    gas_last_value: gas_last_value
                })
            })
            .catch(console.log);
    }
    else{
        res.redirect('/signin');
        alert('Something going wrong!');
    }
})

router.post('/enter' ,(req, res) => {
    if(!req.body) return res.sendStatus(400);

    const {electro, gas, water} = req.body;
    let electro_rate, gas_rate, water_rate, postavka_gasa_rate;

    let today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth()+1);
    let yyyy = String(today.getFullYear());
    let data = dd + '.' + mm + '.' + yyyy;

    let previleges = 1;

    let ten = new Promise((resolve, reject) => {
        Tenants.findAll({where:{
                personal_account_id: req.cookies.user_id
            }}).then(tenants => {
            let c_of_tenants = 0;
            let percent = 0;
            for(k in tenants){
                c_of_tenants++;
                percent += tenants[k].percent_of_privileges;

            }
            previleges = percent / c_of_tenants;
            resolve();
        })
    })
    ten.then(()=>{
        if(electro) { //Электроенергия
            let prev_electro = 0;
            Counter.findOne({where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 1
                }}).then(start => {
                    prev_electro = start.start_value;
            }).then(()=>{
                let p = new Promise(((resolve, reject) => {
                    Accruals.max('counter_value',{where: {
                            service_id: 1,
                            personal_account_id: req.cookies.user_id
                        }})
                        .then(foundAccrual => {
                            if(foundAccrual){
                                prev_electro = foundAccrual;
                            }
                        }).catch(()=>{console.log('previous accrual not found')})
                    resolve();
                }))
                p.then(()=>{
                    Services.findOne({
                        where: {
                            service_id: 1
                        }
                    }).then(found_service => {
                        electro_rate = found_service.rate;
                        let to_pay = (electro - prev_electro) * electro_rate * previleges;
                        Accruals.create({
                            personal_account_id: req.cookies.user_id,
                            service_id: 1,
                            data: data,
                            counter_value: electro,
                            amount_to_pay: to_pay,
                            paid: 'false'
                        }).catch(err => {
                            console.log('Invalid Accrual');
                        });

                    }).catch('Invalid service found');
                })
            })



        }

        if(gas){
            let prev_gas = 0;
            Counter.findOne({where: {
                personal_account_id: req.cookies.user_id,
                    service_id: 2
                }}).then(start => {
                    prev_gas = start.start_value;
            }).then(()=>{
                let p = new Promise(((resolve, reject) => {
                    Accruals.max('counter_value',{where: {
                            service_id: 2,
                            personal_account_id: req.cookies.user_id
                        }})
                        .then(foundAccrual => {
                            if(foundAccrual){
                                prev_gas = foundAccrual;
                            }
                        }).catch(()=>{console.log('previous accrual not found')})
                    resolve();
                }))
                p.then(()=>{
                    Services.findOne({where:{
                        service_id: 2
                        }}).then(found_service =>{
                            gas_rate = found_service.rate;
                            let to_pay = gas* gas_rate * previleges;
                            Accruals.create({
                                personal_account_id: req.cookies.user_id,
                                service_id: 2,
                                data: data,
                                counter_value: gas,
                                amount_to_pay: to_pay,
                                paid: 'false'
                            }).catch(console.log)
                    }).then(()=>{
                        Services.findOne({where: {
                            service_id: 3
                            }}).then(found_postavka => {
                                postavka_gasa_rate = found_postavka.rate;
                                let to_pay_postavka = gas * postavka_gasa_rate * previleges;
                                Accruals.create({
                                    personal_account_id: req.cookies.user_id,
                                    service_id: 3,
                                    data: data,
                                    counter_value: gas,
                                    amount_to_pay: to_pay_postavka,
                                    paid: 'false'
                                }).catch('Не прошла поставка газа начисление');
                        }).catch('Не прошел запрос к БД вынуть поставку газа');
                    })
                })
            })
        }

        if(water){
            let prev_water = 0;
            Counter.findOne({where: {
                personal_account_id: req.cookies.user_id,
                    service_id: 4
                }}).then(start => {
                    prev_water = start.start_value;
            }).then(()=>{
                let p = new Promise(((resolve, reject) => {
                    Accruals.max('counter_value',{where: {
                            service_id: 4,
                            personal_account_id: req.cookies.user_id
                        }})
                        .then(foundAccrual => {
                            if(foundAccrual){
                                prev_water = foundAccrual;
                            }
                        }).catch(()=>{console.log('previous accrual not found')})
                    resolve();
                }))
                p.then(()=>{
                    Services.findOne({where:{
                        service_id: 4
                        }}).then(found_service => {
                            water_rate = found_service.rate;
                            let to_pay = water * water_rate * previleges;
                            Accruals.create({
                                personal_account_id: req.cookies.user_id,
                                service_id: 4,
                                data: data,
                                counter_value: water,
                                amount_to_pay: to_pay,
                                paid: 'false'
                            }).catch(console.log)
                    })
                })
            })
        }
        res.redirect('/personal');
    })
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

router.get('/ajax',(req, res) => {
        let result;
        Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: req.query.value
            }, raw: true}).then(foundAccruals => {
            result = foundAccruals;
        }).then(()=>{
            res.json(result);
        })
})

router.get('/pay', (req, res) => {
    res.render('pay.hbs',{
        title: 'Оберіть послугу'
    })
})

//TODO: need to finish this page
router.get('/about',(req,res)=>{
    res.render('about.hbs',{
        title: 'О компании'
    })
})



module.exports = router;