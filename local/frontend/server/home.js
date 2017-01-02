const cheerio = require('cheerio')
const http = require('http');

export default function (localWS, wss) {
  var home = function () {
    // Get the SparkUI and parse it for info
    var sparkURL = 'http://localhost:8080';
    http.get(sparkURL, function (res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function () {
        var $ = cheerio.load(output);
        $('ul.unstyled').each(function (i, e) {
          $(e).find('li').each(function (i, e) {
            var raw = $(e).text().replace(/(\r\n|\n|\r|\t)/g, '')
            // console.log(raw);
            var key = raw.split(':')[0].toLowerCase()
            var value = raw.split(':')[1]
            var obj = {}
            obj[key] = value
            let message = {flag: 'sparkNodeInfo', data: obj}
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(message), () => {});
            });
          })
        })
      })
    })

    // call the IPFS REST API for state information
    http.get('http://127.0.0.1:47274/api/v0/id', function (res) {

      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function () {
        let data = JSON.parse(output)
        var id = data.ID
        var publicKey = data.PublicKey
        var obj = {
          id: id,
          status: 'ALIVE',
          publicKey: publicKey,
        }
        let message = {flag: 'ipfsNodeInfo', data: obj}
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(message), () => {});
        });
      })
    })
  }

  setInterval(home, 5000)

  localWS.on('message', function (message) {

    var data = JSON.parse(message.escapeSpecialChars())

    if(data.flag == 'cassandraNodeInfo') {
      message = {flag: 'cassandraNodeInfo', data: JSON.parse(data.text)}
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    }
  })
}