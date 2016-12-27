export default function (localWS, wss) {
  wss.on('connection', function connection (ws) {
    ws.on('message', function incoming (data) {
      data = JSON.parse(data);
      switch (data.flag) {
        case 'getLog':
          if(localWS) {
            localWS.send(JSON.stringify(data))
          }
          break
        default:
      }
    });
  });

  localWS.on('message', function (data) {
    data = JSON.parse(data.escapeSpecialChars())
    let message = {flag: 'getLog', data: {type: data.type, text: data.text}};

    if(data.flag == 'getLog') {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    }
  })
}