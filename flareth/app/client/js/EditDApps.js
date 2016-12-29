import React from 'react';
import {Navbar, globals} from './globals'
require('../sass/editDApps.scss');

var EditDApps = React.createClass({
  createNewDApp: function(argument) {
    var ident = $("#ident").val()
    var fee = $("#fee").val()
    globals.contract.web3.object.createDApp(ident, parseInt(fee), {
      from:"0x82a978b3f5962a5b0957d9ee9eef472ee55b42f1",
      gas: 100,
      gasPrice:1
    }, function() {
    })
  },
  render: function() {
    var ident = (
      <label>
        <span>Identifier</span>
        <input id="ident"/>
      </label>
    )
    var fee = (
      <label>
        <span>Price</span>
        <input id="fee"/>
      </label>
    )

    var create = (
      <button id="create" onClick={this.createNewDApp}>Create</button>
    )

    return (
      <div>
        <Navbar />
        <main id="editDApps">
          {ident}
          {fee}
          {create}
        </main>
      </div>
    )
  }
})

export default EditDApps;