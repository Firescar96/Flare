import React from 'react';
import Market from './Market.sol.js';
import Web3 from 'web3';

// variables that are used throughout the app
var HOST = 'localhost';
var PORT = 8545;

window.web3 = new Web3(new Web3.providers
  .HttpProvider('http://' + HOST + ':' + PORT));
Market.setProvider(web3.currentProvider);

var Navbar = React.createClass({
  getInitialState () {
    return {
      contract: Market.address,
      coinbase: web3.eth.defaultAccount,
    }
  },
  setContract (event) {
    this.setState({contract: event.target.value})
    Market.address = event.target.value;
  },
  setCoinbase (event) {
    this.setState({coinbase: event.target.value})
    web3.eth.defaultAccount = event.target.value
  },
  render () {
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
            <input id='contract' value={this.state.contract} onChange={this.setContract}/>
          </label>
          <label htmlFor='coinbase'>
            <span>Coinbase Address</span>
            <input id='coinbase' value={this.state.coinbase} onChange={this.setCoinbase}/>
          </label>
        </header>
      </div>
    );
  },
  componentDidMount () {
    web3.eth.getAccounts((err, accounts) => {
      web3.eth.defaultAccount = accounts[0]
      this.setState({coinbase: accounts[0]})
    })
  },
})

export {Navbar}