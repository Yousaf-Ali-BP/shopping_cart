// -----------------------------
// 🧩 Core Imports (use const)
// -----------------------------
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const db = require('./config/connection');
const session = require('express-session');

// -----------------------------
// 🚀 App Initialization
// -----------------------------
const app = express();
app.use(express.static('public'));

// -----------------------------
// 🧭 Route Imports
// -----------------------------
const userRouter = require('./routes/user');   
const adminRouter = require('./routes/admin'); 

// -----------------------------
// 🖼️ View Engine Setup
// -----------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));

// -----------------------------
// ⚙️ Middleware
// -----------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// -----------------------------
// 🔐 Session Middleware
// -----------------------------
app.use(session({
    secret:'Error404NotFoundKey!@2025',
    cookie:{maxAge:1800000},
    resave: false,
    saveUninitialized: false
}))

// -----------------------------
// 🗄️ Database Connection
// -----------------------------
console.log('Trying to connect to database...');

db.connect()
    .then(() => console.log('✅ Connected to database'))
    .catch(err => console.error('❌ Database connection failed:', err));

// -----------------------------
// 🚦 Routes
// -----------------------------
app.use('/', userRouter);
app.use('/admin', adminRouter);

// -----------------------------
// 🚫 404 Error Handler
// -----------------------------
app.use((req, res, next) => {
    next(createError(404));
});

// -----------------------------
// 💥 Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

// -----------------------------
// 📦 Export the App
// -----------------------------
module.exports = app;
