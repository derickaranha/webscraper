var express = require('express');
var http = require('http');
var path = require('path');
//var favicon = require('static-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

//var routes = require('./routes');
//var users = require('./routes/user');
//var scraper = require('./routes/scrape');
//var scraperv1 = require('./routes/scrape-new');
var scraperv2 = require('./routes/scrapev2');
console.log("Finished all requires...");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(express.static(__dirname + '/public'));

//app.use(favicon());
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use(app.router);

//app.get('/', routes.index);
//app.get('/users', users.list);
//app.get('/scrape', scraper.showPage);
//app.get('/scrapev1', scraperv1.showPage);
app.get('/scrapev2', scraperv2.showPage);

console.log("Starting Functions...");
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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

console.log("Reached the End...");




var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});