import React from 'react';
import classnames from 'classnames';
import {Navbar, globals} from './globals'
import Market from './Market.sol.js';
require('../sass/viewDApps.scss');

/* A single Dapp with state taken from the contract */
var DApp = React.createClass({
  getInitialState: function () {
    return {
      ident: 'loading...',
      master: '',
      fee: 0,
      on: false,
    }
  },
  componentWillMount: function () {
    var self = this;
    Market.deployed().dappList.call(this.props.index).then((name) => {
      Market.deployed().dapps.call(name).then((info) => {
        self.setState({
          ident: web3.toAscii(info[0]),
          master: web3.toAscii(info[1]),
          fee: info[2].toNumber(),
          coinbase: info[3],
          state: web3.toAscii(info[4]),
        })
      })
    })
  },
  setActive: function (element) {
    $('.dapp').removeClass('active');
    $('#actions').addClass('active');
    $(element.target).parent().addClass('active');
  },
  render: function () {
    var classes = classnames({
      dapp: true,
      clearLeft: this.props.clearLeft,
    })

    return (
      <label key={this.state.ident} className={classes}>
        <input type='radio' name='dapp' value={this.state.ident}  onClick={this.setActive} readOnly></input>
        <h3 className='ident'>{this.state.ident}</h3>
        <h3 className='master'>{this.state.master}</h3>
        <h3 className='fee'>{this.state.fee}</h3>
        <h3 className='on'>{this.state.state}</h3>
      </label>
    )
  },
})

var DAppActions = React.createClass({
  startup: function () {
    var name = $('input[name=dapp]:checked').val()
    Market.deployed().startDApp.estimateGas(name).then((gas) => {
      Market.deployed().startDApp.sendTransaction(name, {
        gas: gas*2,
      })
    })
  },
  // the equivalent of force quitting the dapp
  fqu: function () {
    var name = $('input[name=dapp]:checked').val()
    Market.deployed().finishDApp.estimateGas(name).then((gas) => {
      Market.deployed().finishDApp.sendTransaction(name, {
        gas: gas*2,
      })
    })
  },
  render: function () {
    return (
      <div id='actions'>
        <h3>Details and Actions</h3>
        <div>
          <button onClick={this.startup}>Start</button>
          <button onClick={this.fqu}>Cancel/Force Quit</button>
        </div>
      </div>
    )
  },
})

/* Grid of all DApps in the market contract */
var ViewDApps = React.createClass({
  getInitialState: function () {
    return {
      numDApps: 0,
    }
  },
  render: function () {
    var div = React.createElement('div', {id: 'display'}, [])
    for(var i = 0; i < this.state.numDApps; i++) {
      if(i % 3 == 0) {
        div.props.children.push(<DApp clearLeft={true} index={i}/>)
      }else {
        div.props.children.push(<DApp clearLeft={false} index={i}/>)
      }
    }
    return (
      <div>
        <Navbar />
        <main id="viewDApps">
          {div}
          <DAppActions />
        </main>
      </div>
    )
  },
  componentDidMount: function () {
    Market.deployed().numDApps.call().then((numDApps) => {
      this.setState({numDApps: numDApps})
    })
  },
})

export default ViewDApps;
