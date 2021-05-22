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

function random(min,max){
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

router.get('/', (req,res)=>{
    res.render('index.hbs',{
        title : 'Комунальні послуги'
    })
})

router.get('/registration', (req,res) =>{
    res.render('registration.hbs',{
        title : 'Реєстрація'
    })
})

router.post('/registration', (req,res)=>{

    if(!req.body)
        return res.sendStatus(400);
    const {userSurname, userName,userLastName, userEmail, userPass, userAddress, userHome, userFlat} = req.body;
    let hashed_pass = bcrypt.hashSync(userPass, salt);

    let surnames = ['Сівчук', 'Чумаченко', 'Ставратій', 'Зубець', 'Багній', 'Горбатюк ', 'Благун', 'Коваль', 'Романенко', 'Коваленко'];
    let names_male = ['Михайло', 'Максим', 'Дмитро', 'Артем', 'Павло'];
    let names_female = ['Юлія', 'Єлизавета', 'Анастасія', 'Вікторія', 'Олександра'];
    let lastnames_male = ['Павлович', 'Миколайович', 'Іванович', 'Дмитрович', 'Юрійович'];
    let lastnames_female = ['Сергіївна', 'Вікторовна', 'Олександрівна', 'Владиславівна', 'Василівна'];
    let square, heated_square,count_of_tenants;

    square = random(30,100);
    heated_square = square - random(0, 7);
    count_of_tenants = random(1,4);

    Personal_account.findOne({where:{
            street: userAddress
    }})
    .then(found_adress => {
        let per_acc_id;
        if(found_adress == null){
            Personal_account.create({
                street: userAddress,
                house: userHome,
                flat: userFlat,
                square: square,
                heated_square: heated_square,
                count_of_tenants: count_of_tenants
            })
                .then(()=>{
                    return Personal_account.findOne({where:{
                        street: userAddress,
                        house: userHome,
                        flat: userFlat
                        }})
                })
                .then(found_account => {
                    per_acc_id = found_account.personal_account_id;
                    return User.create({
                        surname: userSurname,
                        name: userName,
                        lastname: userLastName,
                        login: userEmail,
                        password: hashed_pass,
                        email: userEmail,
                        telephone: '1',
                        personal_account_id: per_acc_id
                    })
                })
                .then(()=>{
                    for(let i=1; i<=count_of_tenants-1; i++){
                        let sex = random(1,2);
                        let surn = surnames[random(1,10)];
                        let name, lastname;
                        let percent = random(1,10);
                        if(percent === 1){
                            percent = 0.5;
                        }
                        else{
                            if(percent === 2 || percent === 3){
                                percent = 0.75;
                            }
                            else{
                                percent = 1;
                            }
                        }
                        if(sex === 1){
                            name = names_male[random(0,4)];
                            lastname = lastnames_male[random(0,4)];
                        }
                        else{
                            name = names_female[random(0,4)];
                            lastname = lastnames_female[random(0,4)];
                        }
                        Tenants.create({
                            surname: surn,
                            name: name,
                            lastname: lastname,
                            percent_of_privileges: percent,
                            personal_account_id: per_acc_id
                        })
                    }
                    return 0;
                })
                .then(()=>{
                    return Tenants.create({
                        surname: userSurname,
                        name: userName,
                        lastname: userLastName,
                        percent_of_privileges: 1,
                        personal_account_id: per_acc_id
                    })
                })
                .then(()=>{
                    return Counter.create({
                        personal_account_id: per_acc_id,
                        start_value: 0,
                        service_id: 1,
                        counter_number: random(164752, 958476)
                    })
                })
                .then(()=>{
                    return Counter.create({
                        personal_account_id: per_acc_id,
                        start_value: 0,
                        service_id: 2,
                        counter_number: random(164752, 958476)
                    })
                })
                .then(()=>{
                    return Counter.create({
                        personal_account_id: per_acc_id,
                        start_value: 0,
                        service_id: 4,
                        counter_number: random(164752, 958476)
                    })
                })
        }
        else{
            User.create({
                surname: userSurname,
                name: userName,
                lastname: userLastName,
                login: userEmail,
                password: hashed_pass,
                email: userEmail,
                telephone: '1',
                personal_account_id: found_adress.personal_account_id
            })
        }
        ///////
    })
    res.redirect('/signin');
})

router.get('/signin', (req,res)=>{
    res.render('signin.hbs',{
        title : 'Увійти'
    })
})

router.post('/signin', (req, res) => {
    if(!req.body)
        return res.sendStatus(400);
    let login = req.body.login.toString();
    let password = req.body.password.toString();

    User.findOne({where:{
            login: login
        }, raw: true}).then(foundUser=>{
            if(foundUser) {
                let validPassword = bcrypt.compareSync(password, foundUser.password);
                if(validPassword) {
                    Personal_account.findOne({
                        where: {
                            personal_account_id: foundUser.personal_account_id
                        }
                    }).then(foundAccount => {
                        console.log('Authenticated');
                        res.cookie('auth', 'true');
                        res.cookie('user_id', foundAccount.personal_account_id);
                        res.cookie('personal_id', foundUser.user_id);
                        return res.redirect('/personal');
                    })
                }
                else{
                    res.redirect('/signin');
                    console.log('Invalid password');
                }
            }
            else {
                res.redirect('/signin');
                console.log('No User with this values');
            }
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
        let username, count_of_tenants =0;
        let counters;
        User.findOne({where:{
            user_id: req.cookies.personal_id
        }})
        .then(foundUser =>{
            username = `${foundUser.surname} ${foundUser.name} ${foundUser.lastname}`
            return Tenants.findAll({
                where:{
                    personal_account_id: req.cookies.user_id
                }
            })
        })
        .then(found_tenants => {
            for (let key in found_tenants){
                count_of_tenants++;
            }
        })
        .then(()=>{
            return Counter.findAll({where:{
                personal_account_id: req.cookies.user_id
                },raw:true})
        })     
        .then(found_counters => {
            return Personal_account.findOne({where:{
                personal_account_id: req.cookies.user_id
                }})
            .then(found_account =>{
                for(let key in found_counters){
                    let l_schet = '';
                    l_schet += found_counters[key].service_id + 1000;
                    l_schet += found_account.flat;
                    l_schet +=found_account.count_of_tenants;
                    found_counters[key].schet = l_schet;
                    switch (found_counters[key].service_id){
                        case 1: found_counters[key].service_name = 'Електроенергія'; break;
                        case 2: found_counters[key].service_name = 'Газ'; break;
                        case 4: found_counters[key].service_name = 'Водорозподіл'; break;
                    }
                }
                counters = found_counters;
            })
    })
    .then(()=>{
        for(let key in counters) {
            Accruals.max('counter_value', {
                where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: counters[key].service_id
                }
            })
            .then(found_max => {
                counters[key].last_value = found_max;
            })
        }
    })
        .then(()=>{
            return Personal_account.findOne({
                where: {
                    personal_account_id: req.cookies.user_id
                }
            })
        })
        .then(foundAccount => {
            res.render('personal.hbs',{
                title: 'Про квартиру',
                fullName: username ,
                street: foundAccount.street,
                house : foundAccount.house,
                flat  : foundAccount.flat,
                square: foundAccount.square,
                heated_square: foundAccount.heated_square,
                tenants: count_of_tenants,
                counters: counters,
            })
        })
    }
    else {
        res.redirect('/signin');
        alert('Something going wrong!');
    }
})

router.get('/enter', (req,res)=>{
    if(req.cookies.auth === 'true'){
        let electro_start_value = 0, electro_counter_number = "", electro_date = "", electro_last_value = "";
        let gas_start_value = 0, gas_counter_number = "", gas_date = "", gas_last_value = "";
        let water_start_value = 0, water_counter_number = "", water_date = "", water_last_value = "";
        let schet = {};
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
            .then(()=>{
                return Counter.findAll({where:{
                        personal_account_id: req.cookies.user_id
                    },raw:true})
                })
            .then(found_counters => {
                return Personal_account.findOne({where:{
                        personal_account_id: req.cookies.user_id
                    }})
                    .then(found_account =>{
                        schet.electro = '';
                        schet.electro += found_counters[0].service_id + 1000;
                        schet.electro += found_account.flat;
                        schet.electro += found_account.count_of_tenants;

                        schet.gas = '';
                        schet.gas += found_counters[1].service_id + 1000;
                        schet.gas += found_account.flat;
                        schet.gas += found_account.count_of_tenants;

                        schet.water = '';
                        schet.water += found_counters[2].service_id + 1000;
                        schet.water += found_account.flat;
                        schet.water += found_account.count_of_tenants;
                    })
            })
            .then(() => {
                res.render('enter.hbs', {
                    title: 'Внести показання',
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
                    gas_last_value: gas_last_value,
                    schet: schet
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
                            data: today,
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
                                data: today,
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
                                    data: today,
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
                                data: today,
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
            title: 'Статистика нарахувань',
        })
    }
    else{
        res.redirect('/signin');
        alert('Something going wrong!');
    }
})

router.get('/ajax',(req, res) => {
        let result = [];
        if(req.query.after && !req.query.before) {
            Accruals.findAll({
                where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: req.query.value,
                    data: {[Op.gte]: req.query.after}
                }, raw: true
            }).then(foundAccruals => {
                result = foundAccruals;

            }).then(() => {
                res.json(result);
            })
        }
        if(!req.query.after && req.query.before) {
            Accruals.findAll({
                where: {
                    personal_account_id: req.cookies.user_id,
                    service_id: req.query.value,
                    data: {[Op.lte]: req.query.before}
                }, raw: true
            }).then(foundAccruals => {
                result = foundAccruals;

            }).then(() => {
                res.json(result);
            })
        }
    if(req.query.after && req.query.before) {
        Accruals.findAll({
            where: {
                personal_account_id: req.cookies.user_id,
                service_id: req.query.value,
                data: {[Op.gte]: req.query.after,[Op.lte]: req.query.before}
            }, raw: true
        }).then(foundAccruals => {
            result = foundAccruals;

        }).then(() => {
            res.json(result);
        })
    }
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
        total_to_show = total;
    })
    .then(()=>{
        res.render('pay_svet.hbs', {
            title: 'Сплатити електроенергію',
            accruals: accruals_to_show,
            total: total_to_show.toFixed(2)
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
            total_to_show = total;
        })
        .then(()=>{
            res.render('pay_svet.hbs', {
                title: 'Сплатити водорозподіл',
                accruals: accruals_to_show,
                total: total_to_show.toFixed(2)
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
                total: total_to_show.toFixed(2)
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
                total: total_to_show.toFixed(2)
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
                total: total_to_show.toFixed(2)
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
                total: total_to_show.toFixed(2)
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
            return Accruals.findAll({where:{
                    personal_account_id: req.cookies.user_id,
                    service_id: 3,
                    paid: 'false'
                },raw:true})
                .then(found_accruals => {
                    found_postavka_gasa_accrual = found_accruals;
                    if(found_accruals.length != 0){
                        return Accruals.sum('amount_to_pay', {where:{
                                personal_account_id: req.cookies.user_id,
                                service_id: 3,
                                paid: 'false'
                            }})
                            .then(total => {
                                total_postavka_gasa = total;
                                return 0;
                            })
                    }

                })
        })
        .then(()=>{
            let total = total_postavka_gasa + total_gas;
            res.render('pay_gas.hbs', {
                title: 'Сплатити газ',
                total: total.toFixed(2),
                found_gas_accruals: found_gas_accruals,
                found_postavka_gasa_accrual: found_postavka_gasa_accrual
            })
        })
})

router.get('/pay/all',(req,res)=>{
    let total = 0;
    let svet_accrual, gas_accrual, postavka_gasa_accrual, water_accrual, otoplenie_accrual, musor_accrual, domofon_accrual, sdpt_accrual;
    Accruals.sum('amount_to_pay', {where:{
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
            total: total.toFixed(2),
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
        return Payment.create({
            user_id: req.cookies.user_id,
            personal_account_id: req.cookies.user_id,
            service_id: 1,
            date: today,
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
            
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 4,
                date: today,
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
            
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 5,
                date: today,
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
            
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 7,
                date: today,
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
            
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 8,
                date: today,
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
            
            return Payment.create({
                user_id: req.cookies.user_id,
                personal_account_id: req.cookies.user_id,
                service_id: 9,
                date: today,
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
            date: today,
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
            date: today,
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
                    date: today,
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
                        date: today,
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
                        date: today,
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
                        date: today,
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
                        date: today,
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
                        date: today,
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
                        date: today,
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
                        date: today,
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

router.get('payments', (req,res)=>{
    res.render('payments.hbs',{
        title: 'Історія оплат'
    })
})

//TODO: need to finish about page
router.get('/about',(req,res)=>{
    res.render('about.hbs',{
        title: 'Про компанію'
    })
})



module.exports = router;