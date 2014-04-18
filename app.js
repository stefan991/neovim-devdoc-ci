var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var db = require('./db');
var builder = require('./builder');
var routes = require('./routes/index');
var webhook = require('./routes/webhook');

var config_file = process.argv[2] || './config.json';
var config_data = fs.readFileSync(config_file);
try {
    var config = JSON.parse(config_data);
} catch (err) {
    console.log('There has been an error parsing your JSON.')
    console.log(err);
    var config = {}
}

var app = express();

db.init_db(config);

// view engine setup
app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());

app.use(function(req, res, next) {
    req.db = db;
    req.builder = builder;
    req.config = config;
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

app.locals.base_url = config.base_url;
app.locals.latest_documentation_url = config.latest_documentation_url;

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
    var port = config.http_port
    app.listen(port);
    console.log('Express started on port ' + port);
    builder.build_next(db, config);
}

