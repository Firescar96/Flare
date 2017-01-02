import React from 'react';
import {Navbar} from './globals';
import Market from './Market.sol.js';
require('../sass/editDApps.scss');

var EditDApps = React.createClass({
  createNewDApp: function(argument) {
    var ident = $("#ident").val()
    var fee = $("#fee").val()
    var hash = $("#hash").val()
    var classfile = $("#classfile").val()
    Market.deployed().createDApp.estimateGas(ident, parseInt(fee), hash, classfile).then((gas) => {
      Market.deployed().createDApp.sendTransaction(ident, parseInt(fee), hash, classfile, {
        gas: gas*4,
      })
    })
  },
  render: function() {
    return (
      <div>
        <Navbar />
        <main id="editDApps">
        <label>
          <span>Identifier</span>
          <input id="ident"/>
        </label>
        <label>
          <span>Price</span>
          <input id="fee"/>
        </label>
        <label>
          <span>IPFS Hash</span>
          <input id="hash"/>
        </label>
        <label>
          <span>Main Class</span>
          <input id="classfile"/>
        </label>
        <button id="create" onClick={this.createNewDApp}>Create</button>
        </main>
      </div>
    )
  }
})

export default EditDApps;