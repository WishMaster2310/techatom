var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var fs = require('fs');
var views = fs.readdirSync(path.join('views'));
var _ = require('lodash');
var siteDB = require('./datasource/base.json');


var app = module.exports.app = exports.app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/:id', function(req, res, next) {

  var p = req.params.id;
  console.log(p, ' this is p')
  
  var check = _.indexOf(views, (p +'.html'));

  if (check >= 0) {
    res.render(p, { base: siteDB });
  } else {
    var err = new Error ('404')
    next(err)
  }
});

app.get('/', function(req, res, next) {
  res.render('index', { base: siteDB });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('__error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('__error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;