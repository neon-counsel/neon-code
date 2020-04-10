var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var vhost = require('vhost');
var httpProxy = require('http-proxy');
var jwt = require('jsonwebtoken');

//Verify a JWT
function verifyJWT(jwtString){
  var value = jwt.verify(jwtString, 'insertmessagehere');
  return value;
}

var proxy = httpProxy.createProxyServer({});



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectsRouter = require('./routes/projects');

hbs.registerPartials(__dirname + '/views/partials');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// must be placed before urlencoded is used, otherwise POST requests are not sent properly 
app.use(vhost("code.neoncode.ovh", function handle (req, res, next) {
  try {
    var profile = verifyJWT(req.query.cookieAuth);
    if (profile) {
      proxy.web(req, res, { target: 'http://127.0.0.1:'+profile.vs_port}, function(e){
        console.log(e);
      });
    }
  } catch (err) {
    
  }

  
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
