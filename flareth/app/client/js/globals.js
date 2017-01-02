import React from 'react';
import Market from './Market.sol.js';
// import web3 from 'web3';

// variables that are used throughout the app
var HOST = 'localhost';
var PORT = 8545;
var COINBASE = '0xb82dbe47bdcf7776a9c360eabda590742d9a516c';

window.web3 = new Web3(new Web3.providers
.HttpProvider('http://' + HOST + ':' + PORT));
web3.eth.defaultAccount = COINBASE;
Market.setProvider(web3.currentProvider);

  var Navbar = React.createClass({
    getInitialState: function () {
      return {
        contract: Market.address,
        coinbase: COINBASE,
      }
    },
    setContract: function (event) {
      this.newState({contract: event.target.value})
      Market.address = event.target.value;
    },
    setCoinbase: function (event) {
      this.newState({coinbase: event.target.value})
      web3.eth.defaultAccount = event.target.value
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

  export {Navbar}