const {Router} = require('express');
const {Op} = require('sequelize');
const sequelize = require('../models/db-singleton');
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
    })
})

router.get('/registration', (req,res) =>{
    res.render('registration.hbs',{
        title : 'Регистрация'
    })
})

router.post('/registration', (req,res)=>{
    //TODO: доделать регистрацию
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

router.post('/signin', (req, res) => {
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
                        let to_pay = (electro - prev_electro) * electro_rate * previleges.toFixed(2);
                        to_pay.toFixed(2);
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
                            let to_pay = (gas - prev_gas) * gas_rate * previleges.toFixed(2);
                            to_pay.toFixed(2);
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
                                let to_pay_postavka = (gas - prev_gas) * postavka_gasa_rate * previleges.toFixed(2);
                                to_pay_postavka.toFixed(2);
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
                            let to_pay = (water-prev_water) * water_rate * previleges.toFixed(2);
                            to_pay.toFixed(2);
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

router.get('/pay/svet', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 1,
            paid: 'false'
        },raw:true})
    .then(found_accruals => {
        accruals_to_show = found_accruals;
        if(found_accruals.length != 0){
            return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 1,
                paid: 'false'
            }})
        }
    })
    .then(total => {
        console.log(total);
        total_to_show = total;
    })
    .then(()=>{
        res.render('pay_svet.hbs', {
            title: 'Сплатити електроенергію',
            accruals: accruals_to_show,
            total: total_to_show
        })
    })
})

router.get('/pay/voda', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 4,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            accruals_to_show = found_accruals;
            if(found_accruals.length != 0){
                return Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 4,
                        paid: 'false'
                    }})
            }
        })
        .then(total => {
            console.log(total);
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити водорозподіл',
                accruals: accruals_to_show,
                total: total_to_show
            })
        })
})

router.get('/pay/otoplenie', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 5,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            accruals_to_show = found_accruals;
            if(found_accruals.length != 0){
                return Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 5,
                        paid: 'false'
                    }})
            }
        })
        .then(total => {
            console.log(total);
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити опалення',
                accruals: accruals_to_show,
                total: total_to_show
            })
        })
})

router.get('/pay/musor', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 7,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            accruals_to_show = found_accruals;
            if(found_accruals.length != 0){
                return Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 7,
                        paid: 'false'
                    }})
            }
        })
        .then(total => {
            console.log(total);
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити вивіз сміття',
                accruals: accruals_to_show,
                total: total_to_show
            })
        })
})

router.get('/pay/domofon', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 8,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            accruals_to_show = found_accruals;
            if(found_accruals.length != 0){
                return Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 8,
                        paid: 'false'
                    }})
            }
        })
        .then(total => {
            console.log(total);
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити домофон',
                accruals: accruals_to_show,
                total: total_to_show
            })
        })
})

router.get('/pay/sdpt', (req,res) => {
    let total_to_show = 0, accruals_to_show;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 9,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            accruals_to_show = found_accruals;
            if(found_accruals.length != 0){
                return Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 9,
                        paid: 'false'
                    }})
            }
        })
        .then(total => {
            console.log(total);
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити послугу з управління домом',
                accruals: accruals_to_show,
                total: total_to_show
            })
        })
})

router.get('/pay/gas', (req,res) => {
    let total_gas = 0, total_postavka_gasa = 0;
    let found_gas_accruals, found_postavka_gasa_accrual;
    Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 2,
            paid: 'false'
        },raw:true})
        .then(found_accruals => {
            found_gas_accruals = found_accruals;
            if(found_accruals.length != 0){
                Accruals.sum('amount_to_pay', {where:{
                        personal_account_id: req.cookies.user_id,
                        service_id: 2,
                        paid: 'false'
                    }})
                    .then(total => {
                        total_gas = total;
                    })
            }

        })
        .then(()=>{
            Accruals.findAll({where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 3,
                    paid: 'false'
                },raw:true})
                .then(found_accruals => {
                    found_postavka_gasa_accrual = found_accruals;
                    if(found_accruals.length != 0){
                        Accruals.sum('amount_to_pay', {where:{
                                personal_account_id: req.cookies.user_id,
                                service_id: 3,
                                paid: 'false'
                            }})
                            .then(total => {
                                total_postavka_gasa = total;
                            })
                    }

                })
        })
        .then(()=>{
            let total = total_postavka_gasa + total_gas;
            res.render('pay_gas.hbs', {
                title: 'Сплатити газ',
                total: total,
                found_gas_accruals: found_gas_accruals,
                found_postavka_gasa_accrual: found_postavka_gasa_accrual
            })
        })
})

router.get('/pay/all',(req,res)=>{
    let total = 0;
    let svet_accrual, gas_accrual, postavka_gasa_accrual, water_accrual, otoplenie_accrual, musor_accrual, domofon_accrual, sdpt_accrual;
    /*Accruals.sum('amount_to_pay', {where:{
        personal_account_id: req.cookies.user_id,
        service_id: 1,
        paid: 'false'
    }})
    .then(total_svet => {
        total += total_svet;
        return Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 2,
            paid: 'false'
        }})
    })
    .then(total_gas => {
        total += total_gas;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 3,
                paid: 'false'
            }})
    })
    .then(total_gas_postavka => {
        total += total_gas_postavka;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 4,
                paid: 'false'
            }})
    })
    .then(total_otoplenie => {
        total += total_otoplenie;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 5,
                paid: 'false'
            }})
    })
    .then(total_water => {
        total += total_water;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 7,
                paid: 'false'
            }})
    })
    .then(total_musor => {
        total += total_musor;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 8,
                paid: 'false'
            }})
    })
    .then(total_domofon => {
        total += total_domofon;
        return Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 9,
                paid: 'false'
            }})
    })
    .then(total_sdpt => {
        total += total_sdpt;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 1,
                paid: 'false'
            },raw:true})
    })
    .then(found_svet => {
        svet_accrual = found_svet;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 2,
                paid: 'false'
            },raw:true})
    })
    .then(found_gas => {
        gas_accrual = found_gas;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 3,
                paid: 'false'
            },raw:true})
    })
    .then(found_postavka => {
        postavka_gasa_accrual = found_postavka;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 4,
                paid: 'false'
            },raw:true})
    })
    .then(found_water => {
        water_accrual = found_water;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 5,
                paid: 'false'
            },raw:true})
    })
    .then(found_otoplenie => {
        otoplenie_accrual = found_otoplenie;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 7,
                paid: 'false'
            },raw:true})
    })
    .then(found_musor => {
        musor_accrual = found_musor;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 8,
                paid: 'false'
            },raw:true})
    })
    .then(found_domofon => {
        domofon_accrual = found_domofon;
        return Accruals.findAll({where:{
                personal_account_id: req.cookies.user_id,
                service_id: 9,
                paid: 'false'
            },raw:true})
    })
    .then(found_sdpt => {
        sdpt_accrual = found_sdpt;
    })
    .then(() => {
        res.render('pay_all.hbs', {
            title: 'Сплатити все',
            total: total,
            svet_accrual: svet_accrual,
            gas_accrual: gas_accrual,
            postavka_gasa_accrual: postavka_gasa_accrual,
            water_accrual: water_accrual,
            otoplenie_accrual: otoplenie_accrual,
            musor_accrual: musor_accrual,
            domofon_accrual: domofon_accrual,
            sdpt_accrual: sdpt_accrual
        })
    })*/
    res.render('pay_all.hbs', {
        title: 'Сплатити все',
        total: total,
        svet_accrual: svet_accrual,
        gas_accrual: gas_accrual,
        postavka_gasa_accrual: postavka_gasa_accrual,
        water_accrual: water_accrual,
        otoplenie_accrual: otoplenie_accrual,
        musor_accrual: musor_accrual,
        domofon_accrual: domofon_accrual,
        sdpt_accrual: sdpt_accrual
    })
})

router.post('/pay/svet', (req, res) => {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 1,
            paid: 'false'
        }})
    .then(total => {
        //TODO: проверка на дурака, если нажмет на оплату без необходимости оплаты
        let today = new Date();
        let dd = String(today.getDate());
        let mm = String(today.getMonth() + 1);
        let yyyy = String(today.getFullYear());
        let data = dd + '.' + mm + '.' + yyyy;
        return Payment.create({
            user_id: req.cookies.user_id,
            personal_account_id: req.cookies.user_id,
            service_id: 1,
            date: data,
            amount_paid: total
        }).catch(console.log)
    })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 1,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/voda', (req,res)=> {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 4,
            paid: 'false'
        }})
        .then(total => {
            let today = new Date();
            let dd = String(today.getDate());
            let mm = String(today.getMonth() + 1);
            let yyyy = String(today.getFullYear());
            let data = dd + '.' + mm + '.' + yyyy;
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 4,
                date: data,
                amount_paid: total
            }).catch(console.log)
        })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 4,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/otoplenie', (req,res)=> {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 5,
            paid: 'false'
        }})
        .then(total => {
            let today = new Date();
            let dd = String(today.getDate());
            let mm = String(today.getMonth() + 1);
            let yyyy = String(today.getFullYear());
            let data = dd + '.' + mm + '.' + yyyy;
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 5,
                date: data,
                amount_paid: total
            }).catch(console.log)
        })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 5,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/musor', (req,res)=> {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 7,
            paid: 'false'
        }})
        .then(total => {
            let today = new Date();
            let dd = String(today.getDate());
            let mm = String(today.getMonth() + 1);
            let yyyy = String(today.getFullYear());
            let data = dd + '.' + mm + '.' + yyyy;
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 7,
                date: data,
                amount_paid: total
            }).catch(console.log)
        })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 7,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/domofon', (req,res)=> {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 8,
            paid: 'false'
        }})
        .then(total => {
            let today = new Date();
            let dd = String(today.getDate());
            let mm = String(today.getMonth() + 1);
            let yyyy = String(today.getFullYear());
            let data = dd + '.' + mm + '.' + yyyy;
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 8,
                date: data,
                amount_paid: total
            }).catch(console.log)
        })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 8,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/sdpt', (req,res)=> {
    let total = 0;
    Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
            service_id: 9,
            paid: 'false'
        }})
        .then(total => {
            let today = new Date();
            let dd = String(today.getDate());
            let mm = String(today.getMonth() + 1);
            let yyyy = String(today.getFullYear());
            let data = dd + '.' + mm + '.' + yyyy;
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 9,
                date: data,
                amount_paid: total
            }).catch(console.log)
        })
        .then(()=>{
            Accruals.update({paid: 'true'}, {where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: 9,
                    paid: 'false'
                }})
                .then(()=>{
                    res.redirect('/personal');
                })
        })
})

router.post('/pay/gas', (req,res)=> {
    let today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth() + 1);
    let yyyy = String(today.getFullYear());
    let data = dd + '.' + mm + '.' + yyyy;

    Accruals.sum('amount_to_pay', {where:{
        personal_account_id: req.cookies.user_id,
        service_id: 2,
        paid: 'false'
    }})
    .then(total => {
        return Payment.create({
            user_id: req.cookies.user_id,
            personal_account_id: req.cookies.user_id,
            service_id: 2,
            date: data,
            amount_paid: total
        }).catch(console.log)
    })
    .then(()=>{
        Accruals.sum('amount_to_pay', {where:{
            personal_account_id: req.cookies.user_id,
                service_id: 3,
                paid: 'false'
            }})
    })
    .then(total => {
        return Payment.create({
            user_id: req.cookies.user_id,
            personal_account_id: req.cookies.user_id,
            service_id: 3,
            date: data,
            amount_paid: total
        }).catch(console.log)
    })
    .then(()=>{
        Accruals.update({paid: 'true'}, {where: {
            personal_account_id: req.cookies.user_id,
            [Op.or]:[
                {service_id: 2},
                {service_id: 3}
            ],
            paid: 'false'
        }})
        .then(()=>{
            res.redirect('/personal');
        })
    })
})

router.post('/pay/all', (req,res)=> {
    let today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth() + 1);
    let yyyy = String(today.getFullYear());
    let data = dd + '.' + mm + '.' + yyyy;

    Accruals.findAll({where:{
        personal_account_id: req.cookies.user_id,
            service_id: 1,
            paid: 'false'
        },raw: true})
    .then(found => {
        if(found.length !=0){
            Accruals.sum('amount_to_pay', {where:{
                personal_account_id: req.cookies.user_id,
                service_id: 1,
                paid: 'false'
            }})
            .then(total => {
                return Payment.create({
                    user_id: req.cookies.user_id,
                    personal_account_id: req.cookies.user_id,
                    service_id: 1,
                    date: data,
                    amount_paid: total
                }).catch(console.log)
            })
        }
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 2,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 2,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 2,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 3,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 3,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 3,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 4,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 4,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 4,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 5,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 5,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 5,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 7,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 7,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 7,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 8,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 8,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 8,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.findAll({where:{
            personal_account_id: req.cookies.user_id,
            service_id: 9,
            paid: 'false'
        },raw: true})
        .then(found => {
            if(found.length !=0){
                Accruals.sum('amount_to_pay', {where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 9,
                    paid: 'false'
                }})
                .then(total => {
                    return Payment.create({
                        user_id: req.cookies.user_id,
                        personal_account_id: req.cookies.user_id,
                        service_id: 9,
                        date: data,
                        amount_paid: total
                    }).catch(console.log)
                })
            }
        })
    })
    .then(()=>{
        Accruals.update({paid: 'true'}, {where: {
            personal_account_id: req.cookies.user_id,
            paid: 'false'
        }})
        .then(()=>{
            res.redirect('/personal');
        })
    })

})

//TODO: need to finish about page
router.get('/about',(req,res)=>{
    res.render('about.hbs',{
        title: 'О компании'
    })
})



module.exports = router;