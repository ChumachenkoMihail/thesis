const User = require('../models/User');
const Accruals = require('../models/Accruals');
const Services = require('../models/Services');
const Personal_account = require('../models/Personal_account');
const Tenants = require('../models/Tenants');
const Payment = require('../models/Payment');
const Counter = require('../models/Counter');

const CronJob = require('cron').CronJob;

let komunalka = new CronJob('0 1 0 1 * *', function (){
    console.log('cron started');
    // 0 1 0 1 * *
    Personal_account.findAll({attributes:['personal_account_id', 'square']})
        .then(foundAccounts=>{
            async function foo(){
            for(let key in foundAccounts) {
                let vivoz_musora = 0;

                let today = new Date();
                let month = today.getMonth() + 1;
                let dd = String(today.getDate());
                let mm = String(today.getMonth()+1);
                let yyyy = String(today.getFullYear());
                let data = dd + '.' + mm + '.' + yyyy;

                let previleges;
                let count_of_tenants;

                await Tenants.findAll({where:{
                    personal_account_id: foundAccounts[key].personal_account_id
                    }}).then(tenants => {
                        let c_of_tenants = 0;
                        let percent = 0;
                        for(let k in tenants){
                            c_of_tenants++;
                            percent += tenants[k].percent_of_privileges;
                        }
                        previleges = percent / c_of_tenants;
                        count_of_tenants = c_of_tenants;
                })

                //вывоз мусора
                await Services.findOne({where:{service_id:7}})
                    .then(service => {
                        vivoz_musora = count_of_tenants * service.rate * previleges;

                        Accruals.create({
                            personal_account_id: foundAccounts[key].personal_account_id,
                            service_id: 7,
                            data: data,
                            counter_value: 0,
                            amount_to_pay: vivoz_musora,
                            paid: 'false'
                        })
                    })
                //Домофон
                await Services.findOne({where:{service_id:8}})
                    .then(service => {
                        Accruals.create({
                            personal_account_id: foundAccounts[key].personal_account_id,
                            service_id: 8,
                            data: data,
                            counter_value: 0,
                            amount_to_pay: service.rate * previleges,
                            paid: 'false'
                        })
                    })
                //СДПТ
                await Services.findOne({where:{service_id:9}})
                    .then(service => {
                        let sdpt_to_pay = service.rate * foundAccounts[key].square * previleges;
                        Accruals.create({
                            personal_account_id: foundAccounts[key].personal_account_id,
                            service_id: 9,
                            data: data,
                            counter_value: 0,
                            amount_to_pay: sdpt_to_pay,
                            paid: 'false'
                        })
                    })
                //Отопление
                if(month === 1 || month === 2 || month === 3 || month === 11 || month === 12) {
                    await Services.findOne({where: {service_id: 5}})
                        .then(service => {
                            let heating_to_pay = service.rate * foundAccounts[key].square * previleges;
                            Accruals.create({
                                personal_account_id: foundAccounts[key].personal_account_id,
                                service_id: 5,
                                data: data,
                                counter_value: 0,
                                amount_to_pay: heating_to_pay,
                                paid: 'false'
                            })
                                .then(()=>{
                                    console.log('cron access');
                                })
                        })
                }
            }
    }
    foo();
})
},null,true,'Europe/Kiev')

module.exports = komunalka;