const express = require('express');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

// Var
const port = process.env.PORT || 5000;
const app = express();

// Config
require('./config/database');
const passport = require('./config/passport');

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'ilovenodejsandreactreduxelectronreactnative',
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
require('./app/routes')(app, passport);

app.listen(port, () => {
  console.log('Server Started at port ', port);
});
