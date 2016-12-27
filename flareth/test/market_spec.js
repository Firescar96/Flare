var assert = require('assert');
var Embark = require('embark-framework');
var EmbarkSpec = Embark.initTests();

describe("Market", function(done) {

  String.prototype.hexDecode = function () {
    var str = '';
    for (var i = 2; i < this.length; i += 2) {
      var check = parseInt(this.substr(i, 2), 16)
      if(check == "00")
      break
      str += String.fromCharCode(check)
    }
    return str;
  }

  before(function(done) {
    EmbarkSpec.deployAll(done);
  });

  it("should not permit creating dapps without a master", function(done) {
    Market.createDApp("dapp2", 200, "QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB","DatClass",
    function() {
      Market.startDApp("dapp2",
      function() {
        Market.dapps.call("dapp2",
        function(err, dapp) {
          assert.strictEqual("", dapp[0].hexDecode(), "Market was created with no nodes")
          done();
        })
      })
    })
  })
  it("should get node state and ip", function(done) {
    Market.createNode("node1", "online", "127.0.0.1",
    function() {
      Market.nodes.call("node1",
      function(err, node) {
        assert.strictEqual("online", node[1].hexDecode(), "Contract data created incorrectly")
        assert.strictEqual("127.0.0.1", node[2].hexDecode(), "Contract data created incorrectly")
        done();
      })
    })
  })
  it("should add multiple nodes", function(done) {
    Market.createNode("node2", "online", "127.0.0.1",
    function () {
      Market.createNode("node3", "online", "127.0.0.1",
      function () {
        Market.createNode("node4", "online", "127.0.0.1",
        function () {
          Market.createNode("node5", "online", "127.0.0.1",
          function() {
            Market.numNodes.call(function(err, data) {
              assert.strictEqual(data.toNumber(), 5, "Contract data created incorrectly")
              done();
            })
          })
        })
      })
    })
  })
  it("should set a master node", function(done) {
    Market.createDApp("marke2", 200, "QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB","DatClassNo",
    function() {
      Market.dapps.call("marke2",
      function(err,dapp) {
        var hexstate = "node1"
        assert.strictEqual(hexstate, dapp[1].hexDecode(), "Contract data created incorrectly")
        done();
      })
    })
  })
  it("should let master start dapps", function(done) {
    Market.createNode("node6", "online", "127.0.0.1", function () {
      Market.createDApp("dapp2", 200, "QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB","DatClassNo", function() {
        Market.startDApp("dapp2", function() {
          Market.dapps.call("dapp2", function(err,dapp) {
            assert.strictEqual("start",dapp[4].hexDecode(), "Contract data created incorrectly")
            done();
          })
        })
      })
    })
  })
  it("should get dapps fee", function(done) {
    Market.dapps.call("marke2", function(err,dapp) {
      var fee = 200
      assert.strictEqual(fee, dapp[2].toNumber(), "Contract data created incorrectly")
      done();
    })
  })
  it("should set ipfsHash and class", function(done) {
    Market.dapps.call("marke2", function(err,dapp) {
      var fee = 200
      assert.strictEqual(fee, dapp[2].toNumber(), "Contract data created incorrectly")
      var ipfsname = "QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB"
      assert.strictEqual(ipfsname, dapp[5].hexDecode(), "Contract data created incorrectly")
      var classname = "DatClassNo"
      assert.strictEqual(classname, dapp[6].hexDecode(), "Contract data created incorrectly")
      done();
    })
  })
  it("should make other nodes become workers", function(done) {
    Market.nodes.call("node1", function(err,node) {
      assert.strictEqual("master", node[1].hexDecode(), "Contract data created incorrectly")
      Market.nodes.call("node2", function(err,node) {
        assert.strictEqual("worker",node[1].hexDecode(), "Contract data created incorrectly")
        Market.nodes.call("node3", function(err,node) {
          assert.strictEqual("worker",node[1].hexDecode(), "Contract data created incorrectly")
          done();
        })
      })
    })
  })
  it("should reset nodes when dapp finished", function(done) {
    Market.finishDApp("dapp2", function() {
      Market.dapps.call("dapp2", function(err,dapp) {
        assert.strictEqual("",dapp[0].hexDecode(), "Contract data created incorrectly")
        Market.nodes.call("node6", function(err,node) {
          assert.strictEqual("online", node[1].hexDecode(), "did not reset all nodes")
          Market.nodes.call("node3", function(err,node) {
            assert.strictEqual("worker", node[1].hexDecode(), "reset a node that was in a different dapp")
            done()
          })
        })
      })
    })
  })
})
