export default function (localWS, wss) {
  localWS.on('message', function (data) {
    data = JSON.parse(data.escapeSpecialChars())

    if(data.flag == 'submit') {
      var message = {flag: 'submit', data: {}}
      if(data.success) {
        message.data.hash = data.hash;
        message.data.state = 'completed';
      } else {
      message.data.state = 'failed';
      }

      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message), () => {});
      });
    }
  })
}