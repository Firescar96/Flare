contract('Market', function(accounts) {

  var market;

  String.prototype.hexDecode = function () {
    var str = '';
    for (var i = 2; i < this.length; i += 2) {
      var check = parseInt(this.substr(i, 2), 16)
      if(check == '00')
      break
      str += String.fromCharCode(check)
    }
    return str;
  }

  before(function() {
    market = Market.deployed();
  });

  it('should not permit creating dapps without a master', function(done) {
    market.createDApp.sendTransaction('dapp2', 200, 'QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB','DatClass').then(() => {
      return market.startDApp('dapp2')
    }).then(() => {
      return market.dapps.call('dapp2')
    }).then((dapp, err) => {
      assert.strictEqual('', dapp[0].hexDecode(), 'market was created with no nodes')
      done();
    })
  })

  it('should get node state and ip', function(done) {
    market.createNode('node1', 'online', '127.0.0.1').then(() => {
      return market.nodes.call('node1')
    }).then((node) => {
        assert.strictEqual('online', node[1].hexDecode(), 'Contract data created incorrectly')
        assert.strictEqual('127.0.0.1', node[2].hexDecode(), 'Contract data created incorrectly')
        done();
      })
    })

  it('should add multiple nodes', function(done) {
    market.createNode('node2', 'online', '127.0.0.1').then(() => {
      return market.createNode('node3', 'online', '127.0.0.1')
    }).then(() => {
      return market.createNode('node4', 'online', '127.0.0.1')
    }).then(() => {
      return market.createNode('node5', 'online', '127.0.0.1')
    }).then(() => {
      return market.numNodes.call()
    }).then((data) => {
      assert.strictEqual(data.toNumber(), 5, 'Contract data created incorrectly')
      done();
    })
  })

  it('should set a master node', function(done) {
    market.createDApp('marke2', 200, 'QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB','DatClassNo')
    .then(() => {
      return market.dapps.call('marke2')
    }).then((dapp) => {
      var hexstate = 'node1'
      assert.strictEqual(hexstate, dapp[1].hexDecode(), 'Contract data created incorrectly')
      done();
    })
  })

  it('should let master start dapps', function(done) {
    market.createNode('node6', 'online', '127.0.0.1').then(() => {
      return market.createDApp('dapp2', 200, 'QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB','DatClassNo')
    }).then(() => {
      return market.startDApp('dapp2')
    }).then(() => {
      return market.dapps.call('dapp2')
    }).then((dapp) => {
      assert.strictEqual('start',dapp[4].hexDecode(), 'Contract data created incorrectly')
      done();
    })
  })

  it('should get dapps fee', function(done) {
    market.dapps.call('marke2').then((dapp) => {
      var fee = 200
      assert.strictEqual(fee, dapp[2].toNumber(), 'Contract data created incorrectly')
      done();
    })
  })

  it('should set ipfsHash and class', function(done) {
    market.dapps.call('marke2').then((dapp) => {
      var fee = 200
      assert.strictEqual(fee, dapp[2].toNumber(), 'Contract data created incorrectly')
      var ipfsname = 'QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB'
      assert.strictEqual(ipfsname, dapp[5].hexDecode(), 'Contract data created incorrectly')
      var classname = 'DatClassNo'
      assert.strictEqual(classname, dapp[6].hexDecode(), 'Contract data created incorrectly')
      done();
    })
  })

  it('should make other nodes become workers', function(done) {
    market.nodes.call('node1').then((node) => {
      assert.strictEqual('master', node[1].hexDecode(), 'Contract data created incorrectly')
      return market.nodes.call('node2')
    }).then((node) => {
      assert.strictEqual('worker',node[1].hexDecode(), 'Contract data created incorrectly')
      return market.nodes.call('node3')
    }).then((node) => {
      assert.strictEqual('worker',node[1].hexDecode(), 'Contract data created incorrectly')
      done();
    })
  })

  it('should reset nodes when dapp finished', function(done) {
    market.finishDApp('dapp2').then(() => {
      return market.dapps.call('dapp2')
    }).then((dapp) => {
      assert.strictEqual('',dapp[0].hexDecode(), 'Contract data created incorrectly')
      return market.nodes.call('node6')
    }).then((node) => {
      assert.strictEqual('online', node[1].hexDecode(), 'did not reset all nodes')
      return market.nodes.call('node3')
    }).then((node) => {
      assert.strictEqual('worker', node[1].hexDecode(), 'reset a node that was in a different dapp')
      done()
    })
  })
})
