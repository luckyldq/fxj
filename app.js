var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const http = require('http');
const https = require('https');
const fs = require('fs');

let cert_PATH = path.resolve(__dirname, './https');
const httpsOptions = {
    key:fs.readFileSync(cert_PATH + "/3104672_www.ablogs.top.key"),
    cert:fs.readFileSync(cert_PATH + "/3104672_www.ablogs.top.pem")
};

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let apiRouter = require('./api/queryData.js');

var app = express();

// let commmonConfig = require('./config/config');
app.locals.debug = 'true';
app.locals.ALLOWORIGIN = 'http://www.quan8.plus';

if(app.locals.debug == 'true'){
  app.locals.ALLOWORIGIN = '*';
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/fxj_v1', apiRouter);

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

// app.listen(80,function(){
//   console.log('Server Start!');
// });

let httpServer = http.createServer(app);
let httpsServer  = https.createServer(httpsOptions,app);

httpServer.listen(8100,()=>{
  console.log('http 服务开启成功');
});
httpsServer.listen(443,()=>{
  console.log('https 服务开启成功');
});

module.exports = app;