const express = require('express');
const hbs = require('hbs');
const exphbs = require('express-handlebars');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');
const Database = require(__dirname + '/db');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;


//директория со статическими файлами
app.use(express.static(__dirname + '/public'));

app.use(routes);
app.use(cookieParser);




//Для работы с шаблонизатором handlebars
app.engine('hbs', exphbs(
    {
        layoutsDir: "views/layouts",
        defaultLayout: 'layout',
        extname: 'hbs'
    }
));

//Директория с частичными шаблонами
hbs.registerPartials(__dirname + "/views/partials");

//Установка шаблонизатором handlebars
app.set('view engine', 'hbs');
app.set('views', 'views');



//На каком порту работает сервер
app.listen(PORT, (err) =>{
    if(err)
        throw err;
    else
        console.log(`Server is running at ${PORT} port`);
});

