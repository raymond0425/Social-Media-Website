var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var monk = require('monk');
var db = monk('127.0.0.1:27017/assignment2');

var notesRouter = require('./routes/notes.js');

var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to routers 
app.use(function(req,res,next){
    req.db = db; 
	next();
});

app.use(cors());
app.options('*', cors());

app.use('/', notesRouter);

// use cookieParser to parse cookies
app.use(cookieParser());

app.use(session({
    secret: 'random_string_goes_here',
    resave: false,
    saveUnitialized: true
}))

// for requests not matching the above routes, create 404 error and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development environment
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//module.exports = app; 
app.listen(3001);
