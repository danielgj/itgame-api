var express = require('express');
var wagner = require('wagner-core');
var path = require('path');
var http = require('http');
var configParams = require('./config')();
var models = require('./models')(wagner,configParams);
var messages = require('./messages')();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function (err, req, res, next) {
  if (err.name === messages.unauthorized_error) {
    if(err.message === messages.jwt_expired_error) {
      res.status(449).send(messages.expired_token_msg);
    } else if(err.message === messages.not_token_error) {
      res.status(401).send(messages.token_not_found_msg);
    } else {
      res.status(401).send(messages.invialid_token_msg);
    }
  }
});

// development error handler -->  will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
  });

}

// production error handler --> no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.use('*', function(req, res, next) {
        
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    next();
        
});

app.use("/badge", express.static(path.join(__dirname, 'public/badges')));
app.use("/avatar", express.static(path.join(__dirname, 'public/avatars')));
app.use("/skill", express.static(path.join(__dirname, 'public/skills')));


//Routes
var indexRouter = require('./routes/index')(wagner,configParams,messages);
var userRouter = require('./routes/user')(wagner,configParams,messages);
var avatarRouter = require('./routes/avatar')(wagner,configParams,messages);

var jiraWebHookRouter = require('./routes/jira_wh')(wagner,configParams,messages);

app.use(configParams.base_api_url + '/', indexRouter);
app.use(configParams.base_api_url + '/user', userRouter);
app.use(configParams.base_api_url + '/avatar', avatarRouter);
app.use(configParams.base_api_url + '/jiraWH', jiraWebHookRouter);


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function() {
   console.log('Server listening on port ',port);
});
server.on('error', onError);
server.on('listening', onListening);


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
