exports = module.exports = function () {
  //indicator variable for when it's safe to get values that are set in this file's async methods are complete
  var globalsReady = false
  const fs = require('fs')
  const WebSocketServer = require('ws').Server
  const Web3 = require('web3')
  const Market = require('./Market.sol.js')

  //variables that are used throughout the app
  HOST = 'localhost'
  PORT = 8545
  let globals = {
    ident: '',
    masterWSClient: null,
    workerWSClients: []
  }

  //TESTRPC
  let provider = new Web3.providers.HttpProvider('http://' + HOST + ':' + PORT)
  var web3 = new Web3(provider)
  Market.setProvider(provider)


  //if in a integration testing mode use a different port
  //TODO attach to an https server instead of plain ws
  if(process.env.IS_MIRROR) {
    masterWSServer = new WebSocketServer({
      host: '127.0.0.1',
      port: 35385,
      path: '/master'
    })
  }else {
    masterWSServer = new WebSocketServer({
      host: '127.0.0.1',
      port: 35384,
      path: '/master'
    }) // 35384 is 'fleth' (flare ethereum) on keypads
  }

  masterWSServer.on('connection', function (connection) {

    //only let the local Flare node connect to masterWSClient messages
    var isMaster
    if(process.env.IS_MIRROR) {
      if(connection.upgradeReq.headers.host=='localhost:35385')
      isMaster = true
      else
      isMaster = false
    }
    else {
      if(connection.upgradeReq.headers.host!='localhost:35384')
      isMaster = true
      else
      isMaster = false
    }

    if(isMaster) {
      globals.masterWSClient = connection
      connection.on('message', function(message) {
        console.log('Spark Master Received Message: ' + message);
        var data = JSON.parse(message)
        if(data.flag == 'init') {
          globals.ident = data.ident
          web3.eth.defaultAccount = data.coinbase
          Market.address = data.contract
          globalsReady = true
        }

        if(data.flag == 'processPayment') {
          var ident = globals.ident
          var operations = data.operations
          Market.deployed().payNode(ident, operations, {}, function() {})
        }
      })
    }
    else {
      globals.workerWSClients.push(connection)
      connection.on('message', function(message) {
        //TODO: maybe don't automatically accept these requests from nodes
        if(data.flag == 'processPayment') {
          var ident = globals.ident
          var operations = data.operations
          Market.deployed().payNode(ident, operations, {}, function() {})
        }
      })
    }
  })

  setInterval(function(){
    if(!globalsReady)
    return

    var ident = globals.ident
    Market.deployed().nodes(ident).then((info) => {
      var state = web3.toUtf8(info[1]).replace(/\0/g, '')
      if(state == 'master') {
        var dappIdent = web3.toAscii(info[3]).replace(/\0/g, '')
        Market.deployed().dapps(dappIdent).then((dappInfo) => {
          var dappState = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
          if(dappState == 'start') {
            var ipfsHash = web3.toAscii(dappInfo[5]).replace(/\0/g, '')
            var classname = web3.toAscii(dappInfo[6]).replace(/\0/g, '')
            globals.masterWSClient.send(JSON.stringify({
              flag: 'startDApp',
              state: state,
              ipfsHash: ipfsHash,
              class: classname,
            }))

            Market.deployed().finishDApp.estimateGas(dappIdent).then((gas) => {
              Market.deployed().finishDApp.sendTransaction(dappIdent, {
                gas: gas * 2,
              })
            })
          }
        })
      }
    })
  }, 1000)
}
