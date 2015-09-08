//Tests for calling web3 functions in main.js
//testRPC must be running with a deployed contract
'use strict';
MochaWeb.testOnly(function(){
  describe('main-web3', function () {

    var IDENT = "testNode"
    var COINBASE1 = '82a978b3f5962a5b0957d9ee9eef472ee55b42f1'
    var COINBASE2 = '7d577a597b2742b498cb5cf0c26cdcd726d39e6e'
    var CONTRACT = "7ee3a99211006b20628eb15cec98a8acfea3e183"
    var TXOBJECT1
    var TXOBJECT2

    before(function (done) {
      var doneTimer = setInterval(Meteor.bindEnvironment(function(){
        if(ServerSession.get("web3Ready") && ServerSession.get("blockappsReady")) {
          TXOBJECT1 = {
            from: COINBASE1,
            gas: 100,
            gasPrice:1
          }
          TXOBJECT2 = {
            from: COINBASE2,
            gas: 100,
            gasPrice:1
          }
          done()
          clearInterval(doneTimer)
        }
      }), 500)
    })

    it("should have defined blockapps xabis", function(){
      chai.assert(globals.contract.blockapps.xabis);
    });

    it("should have defined web3 factory", function(){
      chai.assert(globals.contract.web3.factory);
    });

    var ws
    it("should allow websocket connections",function(done) {
      var WebSocket = Meteor.npmRequire('ws');
      ws = new WebSocket('ws://localhost:35385/master');

      ws.on('open', function open() {
        done()
      });
    })

    describe('initialization when sent the init message', function () {
      it("should set the web3 globals", function(done) {

        ws.send(JSON.stringify({
          flag: "init",
          privateKey: "",
          ident: IDENT,
          coinbase: COINBASE1,
          contract: CONTRACT
        }))
        var doneTimer = setInterval(Meteor.bindEnvironment(function(){
          if(ServerSession.get("globalsReady")) {
            chai.assert(globals.contract.web3.object);
            done()
            clearInterval(doneTimer)
          }
        }), 500)
      })
    })

    describe('node master start message', function(){
      this.timeout(3000)
      var FEE = 200
      var initialBalance = -FEE
      it('should detect start using web3', function(done) {
        ws.on('message', function(message, flags){
          var data = JSON.parse(message)
          if(data.flag == "startDApp")
          done()
        })

        var market = globals.contract.web3.object
        market.createNode(IDENT, "online", "127.0.0.1", TXOBJECT2,function () {
          market.createDApp("dapp1", FEE, TXOBJECT1,function() {
            market.startDApp("dapp1", TXOBJECT1, function() {
            })
          })
        })
      })
    })

    describe('node payment', function(){
      this.timeout(2000)
      var FEE = 200
      var initialBalance = -FEE
      it('should pay nodes using web3', function(done) {
        var market = globals.contract.web3.object
        market.nodes.call(IDENT , function(err,node) {
          initialBalance = web3.eth.getBalance(node[4]).toNumber()

          ws.send(JSON.stringify({
            flag: "processPayment",
            operations: 1
          }))
        })

        var payTimer = setInterval(Meteor.bindEnvironment(function(){
          market.nodes.call(IDENT, function(err,node) {
            var newBalance = web3.eth.getBalance(node[4]).toNumber()
            chai.assert.strictEqual(initialBalance+FEE,newBalance,"the new balance should include the fee")
            done()
            clearInterval(payTimer)
          })
        }), 500)
      })
    })

  });
});
