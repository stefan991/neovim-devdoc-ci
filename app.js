var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var db = require('./db');
var routes = require('./routes/index');
var webhook = require('./routes/webhook');

var app = express();

db.init_db();

// view engine setup
app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());

app.use(function(req, res, next) {
    req.db = db;
    next()
});

app.use('/', routes);
app.use('/webhook', webhook);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

if (!module.parent) {
    app.listen(5000);
    console.log('Express started on port 5000');
}

