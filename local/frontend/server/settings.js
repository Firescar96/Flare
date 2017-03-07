export default function (localWS, wss) {
  wss.on('connection', function connection (ws) {
    ws.on('message', function incoming (data) {
      console.log('received: %s', data);
      data = JSON.parse(data);
      switch (data.flag) {
        case 'setConfig':
          var message = {
            flag: 'setConfig',
            text: JSON.stringify(data.fields),
          }
          console.log(message);
          if(localWS) {
            localWS.send(JSON.stringify(message))
          }
          break
        case 'getConfig':
          localWS.send(JSON.stringify({flag: 'getConfig'}))
        default:
      }
    });
  });

  localWS.on('open', function () {
    localWS.send(JSON.stringify({flag: 'getConfig'}))
  })

  localWS.on('message', function (message) {
    var data = JSON.parse(message.escapeSpecialChars())

    if(data.flag == 'config') {
      message = {flag: 'getConfig', data: JSON.parse(data.text)}
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    }
  })
}