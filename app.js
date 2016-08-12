var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, 'public')));

/**
* Get port from environment and store in Express.
*/
app.set('port', process.env.PORT || '3000');

require('./routes')(app);

var server = http.createServer(app);

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

require('./server/main.js')(server);