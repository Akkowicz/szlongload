require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');

const reqLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10
});

const indexRouter = require('./routes/index');
const filesRouter = require('./routes/file');

const app = express();

// view engine setup
app.set('views', path.join('./', 'views'));
app.set('view engine', 'pug');

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join('./', 'public'), { maxAge: 600000 }));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/file', reqLimiter);

app.use('/', indexRouter);
app.use('/file', filesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === 'dev' ? err : {status: err.status};

    const errRes = async (err) => {
        await res.status(err.status || 500);
        await res.render('error');
    };
    // render the error page
    errRes(err);
});

module.exports = app;
