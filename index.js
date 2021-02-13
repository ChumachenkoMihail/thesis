const express = require('express');
const hbs = require('hbs');
const exphbs = require('express-handlebars');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

//Необходимо для работы body-parser и обработки форм
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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

//директория со статическими файлами
app.use(express.static(__dirname + '/public'));


app.use(routes);

//На каком порту работает сервер
app.listen(PORT, (err) =>{
    if(err)
        throw err;
    else
        console.log(`Server is running at ${PORT} port`);
});


