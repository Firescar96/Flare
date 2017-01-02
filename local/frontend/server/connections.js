const cheerio = require('cheerio')
const http = require('http');
const exec = require('child_process').exec;

export default function (localWS, wss) {
  var connections = function () {
    // TODO: Potentially use the spark ui logs instead, potentially scan using go
    var sparkURL = 'http://localhost:8080';
    http.get(sparkURL, function (res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function () {
        var $ = cheerio.load(output)

        var master = {}
        var title = $('h3').text()
        // remove the link to extract the title
        var titleText = title.replace($('h3 a').text(), '')
        // parse out the address portion
        master.address = titleText.trim().split(' ')[3]

        var nodes = []
        var nodeArray = $('table.table tr').get().map(function (row) {
          return $(row).find('td').get().map(function (cell) {
            return $(cell).text();
          });
        });
        $(nodeArray).each(function (i, e) {
          nodes.push({
            ID: e[0].replace(/(\s)/g, ''),
            address: e[1],
            state: e[2],
            cores: e[3],
            memory: e[4].replace(/(\s+)/g, ' '),
          })
        })

        let message = {
          flag: 'sparkConnections',
          data: {master: master, nodes: nodes},
        }
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(message), () => {});
        });
      })

    })

    exec('ipfs swarm peers', function (err, out, code) {
      let message = {flag: 'ipfsConnections', data: {data: out.split('\n')}}
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    })
  }

  setInterval(connections, 5000)

  localWS.on('message', function (message) {
    var data = JSON.parse(message.escapeSpecialChars())

    if(data.flag == 'cassandraNodeRing') {
      message = {flag: 'cassandraConnections', data: JSON.parse(data.text)}
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    }
  })
}
