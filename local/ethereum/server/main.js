exports = module.exports = function () {
  //indicator variable for when it's safe to get values that are set in this file's async methods are complete
  var globalsReady = false
  const fs = require('fs')
  const WebSocketServer = require('ws').Server
  const Web3 = require('web3')
  //variables that are used throughout the app
  globals = {
    ident: '',
    coinbase: '',
    contract: {
      address: '',
      web3: {
        factory: null,
        object: null,
        host: 'localhost',
        port: 8545
      }
    },
    masterWSClient: null,
    workerWSClients: []
  }

  var contractCode = fs.readFileSync('contracts/Market.sol').toString()

  //TESTRPC
  var web3 = new Web3(new Web3.providers.HttpProvider('http://'+globals.contract.web3.host + ':' + globals.contract.web3.port));

  var web3Promise = new Promise( function(resolve, reject) {
    web3.eth.compile.solidity(contractCode, function(err, compiledCode) {
      var abi = compiledCode.info.abiDefinition
      globals.contract.web3.factory = web3.eth.contract(abi)

      resolve()
    })
  })

  web3Promise.then(function () {

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
            globals.coinbase = data.coinbase
            globals.contract.address = data.contract

            var contractFactory = globals.contract.web3.factory
            globals.contract.web3.object = contractFactory.at(globals.contract.address)
            globalsReady = true
          }

          if(data.flag == 'processPayment') {
            var ident = globals.ident
            var operations = data.operations
            globals.contract.web3.object.payNode(ident,operations, {
              from: globals.coinbase,
              gas: 1,
              gasPrice:100
            }, function() {})
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
            globals.contract.web3.object.payNode(ident,operations, {
              from: globals.coinbase,
              gas: 1,
              gasPrice:100
            }, function() {})
          }
        })
      }
    })
  })

  setInterval(function(){
    if(!globalsReady)
    return
    var contract = globals.contract

    var ident = globals.ident
    contract.web3.object.nodes.call(ident,function(err,info) {
      var state = web3.toUtf8(info[1]).replace(/\0/g, '')
      if (state == 'master') {
        var dappIdent = web3.toAscii(info[3]).replace(/\0/g, '')
        contract.web3.object.dapps.call(dappIdent,function(err,dappInfo) {
          var dappState = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
          if(dappState == 'start') {
            var ipfsHash = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
            var classname = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
            globals.masterWSClient.send(JSON.stringify({flag: 'startDApp', state:state, ipfsHash:ipfsHash, class:classname}))
          }
        })
      }
    })
  }, 1000)
}
