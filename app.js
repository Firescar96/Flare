// Credit for the framework of the file uploading code goes to https://github.com/jodosha/node-upload-progress
const flareConf = process.env.FLARECONF
const confJSON = require(flareConf)
import WebSocket from 'ws'
const WebSocketServer = WebSocket.Server
var express = require('express');
var http = require('http');
var path = require('path');
import formidable from 'formidable';
import keys from 'keys';
import main from './server/main'

var app = express();
var localWS;
var wss;

app.store = new keys.Memory();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, 'public')));

/**
* Get port from environment and store in Express.
*/
app.set('port', process.env.PORT || '35273');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/*', function (req, res, next) {
  res.render('index.html');
});

// File upload handling
app.post('/submit', function (req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    app.store.set('progress', '100');

    let message = {
      flag: 'submit',
      class: 'DDAppTemplate',
      name: files.upload.path,
    }

    // flag for when frontend requests a log
    localWS.send(JSON.stringify(message))

    res.sendStatus(200);
  });

  form.on('progress', function (bytesReceived, bytesExpected) {
    var progress = Math.round( (bytesReceived / bytesExpected * 100) ).toString();

    var message = {flag: 'submit', data: {progress: progress}}

    wss.clients.forEach((client) => {
      client.send(JSON.stringify(message), () => {});
    });
  });
});

var server = http.createServer(app);

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});


// create a connection to the local Flare controller
// 35275 is 'flark' (flare spark) on keypads
localWS = new WebSocket('ws://' +
confJSON.flare.local.ip + ':' + confJSON.flare.local.port + '/local')

localWS.on('error', function (error) {
  console.log('Local WebSocket Connect Error: ' + error.toString());
})
localWS.on('message', function (message) {
  console.log('Flare Received Message: ' + message.escapeSpecialChars().substring(0, 1000));
})

// start a WSS for clients to send the server messages
wss = new WebSocketServer({ server: server });

wss.on('connection', function connection (conn) {
  conn.on('close', function (code, reason) {
    console.log(conn.host + ' Connection closed: ' + reason);
  });

  conn.on('error', (err) => {
    // the client disappeared, and that's ok
    // this should be an ETIMEDOUT error
  });
});

// now that the general init is done, move on to component initialization
main(server, localWS, wss);