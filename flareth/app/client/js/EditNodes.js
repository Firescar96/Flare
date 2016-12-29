import React from 'react';
import {Navbar, globals} from './globals'
require('../sass/editNodes.scss');

var EditNodes = React.createClass({
  createNewNode: function (argument) {
    var name = $('#name').val()
    var state = $('#state').val()
    var ipaddress = $('#ipaddress').val()
    globals.contract.object.createNode(name, state, ipaddress, {
      from: globals.coinbase,
      gas: 100,
      gasPrice: 1,
    }, function () {
    })
  },
  render: function () {
    var name = (
      <label>
        <span>Name</span>
        <input id='name'/>
      </label>
    )
    var state = (
      <label>
        <span>State</span>
        <input id='state'/>
      </label>
    )
    var ipaddress = (
      <label>
        <span>IP Address</span>
        <input id='ipaddress'/>
      </label>
    )

    var create = (
      <button id='create' onClick={this.createNewNode}>Create</button>
    )

    return (
      <div>
        <Navbar />
        <div id='editNodes'>
          {name}
          {state}
          {ipaddress}
          {create}
        </div>
      </div>
    )
  },
})

export default EditNodes;