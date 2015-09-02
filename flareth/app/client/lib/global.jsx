

Meteor.startup(function() {
  //indicator variable for when it's safe to get values that are set in this file's async methods are complete
  Session.set("globalsReady", false)

  //variables that are used throughout the app
  Meteor.globals = {
    coinbase: "82a978b3f5962a5b0957d9ee9eef472ee55b42f1",
    contract: {
      address: "8dcbc74ec8bfdbb620eb98134589626199a3dd31",
      blockapps: {
        object: null,
        URL: "http://hacknet.blockapps.net",
        userAccount: null
      },
      web3: {
        factory: null,
        object: null,
        host: "localhost",
        port: 8545
      }
    },
    useBlockapps: false //true to use blockapps functionality, false to use a web3 RPC Clint
  }

  /**Configuring the blockapps contract object**/
  var Contract = require("Contract")
  var Solidity = require("Solidity")

  Meteor.globals.contract.blockapps.userAccount = Contract({"privkey":"1dd885a423f4e212740f116afa66d40aafdbb3a381079150371801871d9ea281"})

  var Header = React.createClass({
    getInitialState: function() {
      return {
        contract: Meteor.globals.contract.address,
        coinbase: Meteor.globals.coinbase
      }
    },
    setContract: function(event) {
      this.newState({
        contract: event.target.value
      })
      var contractFactory = Meteor.globals.contract.web3.factory
      Meteor.globals.contract.web3.object = contractFactory.at(event.target.value)
    },
    setContract: function(event) {
      this.newState({
        coinbase: event.target.value
      })
      Meteor.globals.coinbase = event.target.value
    },
    componentDidMount: function() {
      var contractFactory = Meteor.globals.contract.web3.factory
      Meteor.globals.contract.web3.object = contractFactory.at(this.state.contract)
      Meteor.globals.coinbase = this.state.coinbase
    },
    render: function() {
      return (
        <div>
          <label htmlFor="contract">
            <span>Contract Address</span>
            <input id="contract" defaultValue={this.state.contract} onChange={this.setContract}/>
          </label>
          <label htmlFor="coinbase">
            <span>Coinbase Address</span>
            <input id="coinbase" defaultValue={this.state.coinbase} onChange={this.setCoinbase}/>
          </label>
        </div>
      );
    }
  })

  $.get('/contractCode.sol', function(contractCode) {
    //Send the code to blockapps to compile and receive an xabi
    $.ajax({
      type: "POST",
      url: Meteor.globals.contract.blockapps.URL+"/eth/v1.0/solc",
      data: {src: contractCode},
      success: function(data) {
        Meteor.globals.contract.blockapps.object = Contract({address: Meteor.globals.contract.address, symtab: data.xabis})
      },
      dataType: "json"
    });

    /**Configuring the web3 contract object**/

    //var accounts = new Accounts({minPassphraseLength: 6})
    //TODO: have user set their own password
    //var accountObject = accounts.new('password rising quantum boba feature swing longing raccoon')

    //TESTRPC
    web3.setProvider(new web3.providers.HttpProvider('http://'+Meteor.globals.contract.web3.host+':'+Meteor.globals.contract.web3.port));

    web3.eth.compile.solidity(contractCode, function(err, compiledCode) {
      var abi = compiledCode.Market.info.abiDefinition
      Meteor.globals.contract.web3.factory = web3.eth.contract(abi)
      Meteor.globals.contract.web3.object = Meteor.globals.contract.web3.factory.at(Meteor.globals.contract.address)

      Session.set("globalsReady", true)
    })
  }, 'text');

  Tracker.autorun(function() {
    if(Session.get("globalsReady"))
    React.render(<Header/>, $('#headerContent')[0])
  })
})
