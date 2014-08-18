var express = require('express');
var http = require('http');
var path = require('path');
var scraperv2 = require('./routes/scrapev2');
console.log("Finished all requires...");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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




var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});