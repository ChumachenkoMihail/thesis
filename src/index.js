const Server = require('../src/classes/Server');
const CONFIG = require('../config');

new Server(CONFIG.WEB_SERVER_PORT).start();