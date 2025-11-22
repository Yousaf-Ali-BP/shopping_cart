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
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
        inc: function (value) {
            return parseInt(value) + 1;
        }
    }
}));

// -----------------------------
// ⚙️ Middleware
// -----------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// -----------------------------
// 🔐 Session Middleware
// -----------------------------
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    cookie: {maxAge: 1800000},
    resave: false,
    saveUninitialized: false
}))

// -----------------------------
// 🗄️ Database Connection
// -----------------------------

db.connect()
    .then(() => console.log("🟢 DB Ready"))
    .catch((err) => console.error("❌ DB Error:", err));

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
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

// -----------------------------
// 📦 Export the App
// -----------------------------
module.exports = app;