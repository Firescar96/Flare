import React from 'react';
import classnames from 'classnames';
import {Navbar} from './globals'
import Market from './Market.sol.js';
require('../sass/viewNodes.scss');

/* A single Dapp with state taken from the contract */
var Node = React.createClass({
  getInitialState: function () {
    return {
      name: 'loading...',
      state: '',
      ipaddress: '',
      coinbase: '',
      dappIdent: '',
    }
  },
  componentWillMount: function () {
    Market.deployed().nodeList(this.props.index).then((name) => {
      return Market.deployed().nodes.call(name)
    }).then((info) => {
      this.setState({
        ident: web3.toAscii(info[0]),
        state: web3.toAscii(info[1]),
        ipaddress: web3.toAscii(info[2]),
        dappIdent: web3.toAscii(info[3]),
        coinbase: info[4],
      })
    })
  },
  setActive: function (element) {
    $('.node').removeClass('active');
    $('#actions').addClass('active');
    $(element.target).parent().addClass('active');
  },
  render: function () {
    var classes = classnames({
      node: true,
      clearLeft: this.props.clearLeft,
    })

    return (
      <label key={this.state.ident} className={classes}>
        <input type='radio' name='node' value={this.state.ident} onClick={this.setActive} readOnly></input>
        <h3 className='name'>{this.state.ident}</h3>
        <h3 className='state'>{this.state.state}</h3>
        <h3 className='ipaddress'>{this.state.ipaddress}</h3>
        <h3 className='appIdent'>{this.state.dappIdent}</h3>
        <h3 className='coinbase'>{this.state.coinbase}</h3>
      </label>
    )
  },
})

var NodeActions = React.createClass({
  getInitialState: function () {
    return {
      value: 0,
    }
  },
  setValue: function (event) {
    this.setState({
      value: event.target.value,
    })
  },
  payup: function () {
    var name = $('input[name=node]:checked').val()
    Market.deployed().nodes.call(name).then((info) => {
      web3.eth.sendTransaction({
        to: info[4],
        value: 1,
      })
    })
  },
  render: function () {
    return (
      <div id='actions'>
        <h3>Details and Actions</h3>
        <div>
          <label htmlFor='value'>
            <span>Amount</span>
            <input id='value' type='number' value={this.state.value} onChange={this.setValue}/>
          </label>
          <button id='payup' onClick={this.payup}>Donate to Node</button>
        </div>
      </div>
    )
  },
})

/* Grid of all DApps in the market contract */
var ViewNodes = React.createClass({
  getInitialState: function () {
    return {
      numNodes: 0,
    }
  },
  render: function () {
    var div = React.createElement('div', {id: 'display'}, [])
    for(var i = 0; i < this.state.numNodes; i++) {
      if(i % 3 == 0) {
        div.props.children.push(<Node clearLeft={true} index={i}/>)
      }else {
        div.props.children.push(<Node clearLeft={false} index={i}/>)
      }
    }

    return (
      <div>
        <Navbar />
        <main id="viewNodes">
          {div}
          <NodeActions />
        </main>
      </div>
    )
  },
  componentDidMount: function () {
    Market.deployed().numNodes.call().then((numNodes) => {
      this.setState({numNodes: numNodes})
    })
  },
})

export default ViewNodes;

