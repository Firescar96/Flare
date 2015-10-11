Meteor.startup(function() {
  //indicator variable for when it's safe to get values that are set in this file's async methods are complete
  ServerSession.set("globalsReady", false)

  //variables that are used throughout the app
  globals = {
    ident: "",
    coinbase: "",
    contract: {
      address: "",
      blockapps: {
        xabis: null,
        object: null,
        URL: "http://hacknet.blockapps.net",
        userAccount: null
      },
      web3: {
        factory: null,
        object: null,
        host: "localhost",
        port: 8545
      }
    },
    useBlockapps: false, //If a privateKey is sent then we use blockapps, otherwise web3RPC
    masterWSClient: null,
    workerWSClients: []
  }

  /**Configuring the blockapps contract object**/
  /* Broken until blockapps-js is published as a node package
  var Contract = require("Contract")
  var Solidity = require("Solidity")
  */
  var contractCode = Assets.getText("contractCode.sol")

  //Send the code to blockapps to compile and receive an xabi
  HTTP.post(
    globals.contract.blockapps.URL+"/eth/v1.0/solc",
    {params: {src: contractCode}},
    function(error, data) {
      globals.contract.blockapps.xabis = JSON.parse(data.content).xabis
      ServerSession.set("blockappsReady", true)
    }
  )

  //TESTRPC
  web3.setProvider(new web3.providers.HttpProvider('http://'+globals.contract.web3.host+':'+globals.contract.web3.port));

  web3.eth.compile.solidity(contractCode, Meteor.bindEnvironment(function(err, compiledCode) {
    var abi = compiledCode.Market.info.abiDefinition
    globals.contract.web3.factory = web3.eth.contract(abi)

    ServerSession.set("web3Ready", true)
  }))

  //wait for web3 and blockapps variables to be set before cotinuing
  Tracker.autorun(function() {
    if(!(ServerSession.get("web3Ready") && ServerSession.get("blockappsReady")))
    return

    var WebSocketServer = Meteor.npmRequire('ws').Server

    //if in a integration testing mode use a different port
    if(process.env.IS_MIRROR) {
      masterWSServer = new WebSocketServer({
        host: "127.0.0.1",
        port: 35385,
        path: "/master"
      })
    }
    else {
      masterWSServer = new WebSocketServer({
        host: "127.0.0.1",
        port: 35384,
        path: "/master"
      }) //35384 is 'fleth' (flare ethereum) on keypads
    }

    masterWSServer.on('connection', Meteor.bindEnvironment(function(connection) {

      //only let the local Flare node connect to masterWSClient messages
      var isMaster
      if(process.env.IS_MIRROR) {
        if(connection.upgradeReq.headers.host=="localhost:35385")
        isMaster = true
        else
        isMaster = false
      }
      else {
        if(connection.upgradeReq.headers.host!="localhost:35384")
        isMaster = true
        else
        isMaster = false
      }

      if(isMaster) {
        globals.masterWSClient = connection
        connection.on('message', Meteor.bindEnvironment(function(message) {
          console.log('Spark Master Received Message: ' + message);
          var data = JSON.parse(message)

          if(data.flag == "init") {

            //Waiting for blockapps to become node package
            /*if (data.privateKey != "") {
            globals.useBlockapps = true
            globals.contract.blockapps.userAccount = Contract({"privkey":data.privateKey})
            }*/

            globals.ident = data.ident
            globals.coinbase = data.coinbase
            globals.contract.address = data.contract

            var contractFactory = globals.contract.web3.factory
            globals.contract.web3.object = contractFactory.at(globals.contract.address)
            //Waiting for blockapps to become node package
            //globals.contract.blockapps.object = Contract({address: globals.contract.address, symtab: globals.contract.blockapps.xabis})
            ServerSession.set("globalsReady", true)
          }

          if(data.flag == "processPayment") {

            //TODO: implement for blockapps
            if(globals.useBlockapps) {}
            else {
              var ident = globals.ident
              var operations = data.operations
              globals.contract.web3.object.payNode(ident,operations, {
                from: globals.coinbase,
                gas: 1,
                gasPrice:100
              }, function() {})
            }
          }
        }))
      }
      else {
        globals.workerWSClients.push(connection)
        connection.on('message', Meteor.bindEnvironment(function(message) {
          //TODO: maybe don't automatically accept these requests from nodes
          if(data.flag == "processPayment") {

            //TODO: implement for blockapps
            if(globals.useBlockapps) {}
            else {
              var ident = globals.ident
              var operations = data.operations
              globals.contract.web3.object.payNode(ident,operations, {
                from: globals.coinbase,
                gas: 1,
                gasPrice:100
              }, function() {})
            }
          }
        }))
      }
    }))
  })

  setInterval(Meteor.bindEnvironment(function(){
    if(!ServerSession.get("globalsReady"))
    return
    var contract = globals.contract
    if (globals.useBlockapps) {
      contract.blockapps.object.sync(contract.blockapps.URL,function() {
        var ident = globals.ident
        var info = contract.blockapps.object.get["nodes"](ident)
        if (info[1] == "master") {
          var dappIdent = info[3]
          var dappInfo = contract.blockapps.object.get["dapps"](dappIdent)
          if(dappInfo[4] == "start")
          masterWSClient.send(JSON.stringify({flag: "startDApp"}))
        }
      })
    } else {
      var ident = globals.ident
      contract.web3.object.nodes.call(ident,function(err,info) {
        var state = web3.toUtf8(info[1]).replace(/\0/g, '')
        if (state == "master") {
          var dappIdent = web3.toAscii(info[3]).replace(/\0/g, '')
          contract.web3.object.dapps.call(dappIdent,function(err,dappInfo) {
            var dappState = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
            if(dappState == "start") {
              var ipfsHash = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
              var classname = web3.toAscii(dappInfo[4]).replace(/\0/g, '')
              globals.masterWSClient.send(JSON.stringify({flag: "startDApp", ipfsHash:ipfsHash, class:classname}))
            }
          })
        }
      })
    }
  }), 1000)
})
