import React from 'react';
// import web3 from 'web3';

// variables that are used throughout the app
var globals = {
  web3: null,
  coinbase: '82a978b3f5962a5b0957d9ee9eef472ee55b42f1',
  contract: {
    address: 'd6f084ee15e38c4f7e091f8dd0fe6fe4a0e203ef',
    factory: null,
    object: null,
  },
  host: 'localhost',
  port: 8545,
}

globals.web3 = new Web3(new Web3.providers
  .HttpProvider('http://' + globals.host + ':' + globals.port));

  var Navbar = React.createClass({
    getInitialState: function () {
      return {
        contract: globals.contract.address,
        coinbase: globals.coinbase,
      }
    },
    setContract: function (event) {
      this.newState({contract: event.target.value})
      globals.contract.object = globals.contract.factory
      .at(event.target.value)
    },
    setCoinbase: function (event) {
      this.newState({coinbase: event.target.value})
      globals.coinbase = event.target.value
    },
    componentDidMount: function () {
      $.get('/contractCode.sol', function (contractCode) {
        globals.web3.eth.compile.solidity(contractCode, function (err, compiledCode) {
          var abi = compiledCode.info.abiDefinition
          globals.contract.factory = globals.web3.eth.contract(abi)
          globals.contract.object = globals.contract.factory.at(globals.contract.address)
        })
      }, 'text');
    },
    render: function () {
      return (
        <div>
          <nav>
            <h1>Welcome to Flareth</h1>
            <h2>version 0.0.1</h2>

            <ul>
              <a href="/nodes/view"><li>View Nodes</li></a>
              <a href="/nodes/edit"><li>Create Node</li></a>
              <a href="/dapps/view"><li>View DApps</li></a>
              <a href="/dapps/edit"><li>Create DApp</li></a>
            </ul>
          </nav>
          <header>
            <label htmlFor='contract'>
              <span>Contract Address</span>
              <input id='contract' defaultValue={this.state.contract} onChange={this.setContract}/>
            </label>
            <label htmlFor='coinbase'>
              <span>Coinbase Address</span>
              <input id='coinbase' defaultValue={this.state.coinbase} onChange={this.setCoinbase}/>
            </label>
          </header>
        </div>
      );
    },
  })

  export {Navbar, globals}