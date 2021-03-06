var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    passport = require('passport');


// Customized for openshift
//var port = process.env.PORT || 3000
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// get index routes
//var index = require('./routes/index');
//var task = require('./routes/task');

var MONGO_SERVER_URL = "mongodb://localhost:27017";
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    MONGO_SERVER_URL = process.env.OPENSHIFT_MONGODB_DB_URL;
}

var DB_INSTANCE = 'journal';
var CONNECT_STRING = MONGO_SERVER_URL + '/' + DB_INSTANCE;
//var CONNECT_STRING = MONGO_SERVER_URL;

var app = express();
var routes = require('./routes');

// mongoose connection management
mongoose.connect(CONNECT_STRING);
mongoose.connection.on('connected', function () {
    "use strict";
    console.log("Mongoose default connection open now");
});

mongoose.connection.on('error', function (err) {
    "use strict";
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    "use strict";
    console.log('Mongoose default connection disconnected');
});


process.on('SIGINT', function () {
    "use strict";
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});



  // setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('stylus').middleware(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use(cookieParser('secret'));

app.use(session({
   //cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
    secret: "reptile"
}));
app.use(passport.initialize());
app.use(passport.session());



app.use(flash());


require('./config/passport')(passport);
routes(app, passport);

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        "use strict";
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    app.locals.pretty = true;
}


var server = app.listen(server_port, server_ip_address,  function () {
    "use strict";
   //console.log('Listening on port %d', server.address().port);
    console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});

