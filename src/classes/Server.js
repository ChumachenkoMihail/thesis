const express = require('express');
const hbs = require('hbs');
const exphbs = require('express-handlebars');
const routes = require('../routes/routes');
const cookieParser = require('cookie-parser');


class Server {
    constructor(port) {
        this.app = express();
        this.port = port;

        //Директория со статическими файлами
        this.app.use(express.static('src/public'));

        

        this.app.use(cookieParser());
        this.app.use((req,res,next)=>{
            if(req.cookies.auth === 'true')
                res.locals.authenticated = true;
            next();
        });
        this.app.use(routes);

        //Для работы с шаблонизатором handlebars
        this.app.engine('hbs', exphbs(
            {
                layoutsDir: "src/views/layouts",
                defaultLayout: 'layout',
                extname: 'hbs'
            }
        ));

        //Директория с частичными шаблонами
        hbs.registerPartials("src/views/partials");

        //Установка шаблонизатором handlebars
        this.app.set('view engine', 'hbs');
        this.app.set('views', 'src/views');
    }
    start(){
        const STARTUP_MESSAGE = `Server is running at ${this.port} port`;

        this.app.listen(this.port , (err) => {
            if(err)
                throw err;
            else
                console.log(STARTUP_MESSAGE);
        });
    }
}

module.exports = Server;