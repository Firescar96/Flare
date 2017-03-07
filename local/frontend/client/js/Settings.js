import React from 'react';
import {Navbar, Sidebar, ws} from './globals'
require('../sass/settings.scss');

var initialConfig = {
  'cassandra': {
    'directory': '',
    'ip': '',
    'password': '',
    'port': '',
    'username': '',
  },
  'flare': {
    'ident': '',
    'coinbase': '',
    'directory': '',
    'local': {
      'ip': '',
      'port': '',
    },
    'master': {
      'ip': '',
      'port': '',
    },
    'price': '',
  },
  'spark': {
    'cores': '',
    'directory': '',
    'log4j': {
      'conversionPattern': '',
      'appender': '',
      'directory': '',
      'layout': '',
      'maxFileSize': '',
      'rootCategory': '',
    },
    'master': {
      'ip': '',
      'port': '',
    },
    'price': '',
    'receiverMemory': '',
  },
}

var Flare = React.createClass({
  handleChange: function (event) {
    var newState = this.state
    if(event.target.value == '') {
      newState[event.target.name] = event.target.placeholder
      this.props.config.flare[event.target.name] = event.target.placeholder
    }else {
      newState[event.target.name] = event.target.value
      this.props.config.flare[event.target.name] = event.target.value
    }
    this.setState(newState)
    ws.send(JSON.stringify({flag: 'setConfig', fields: this.props.config}))
  },
  render: function () {
    console.log(this.state);
    return (
      <div>
        <h2>Flare</h2>
        <form>
          <div className="halfColumn">
            <label>Directory
              <input type='text' name='directory' placeholder={this.props.config.flare.directory} onChange={this.handleChange}/>
            </label>
            <label>Ethereum Address
              <input type='text' name='coinbase' placeholder={this.props.config.flare.coinbase} onChange={this.handleChange}/>
            </label>
          </div>
          <div className="halfColumn">
            <label>Identifier
              <input type='text' name='ident' placeholder={this.props.config.flare.ident} onChange={this.handleChange}/>
            </label>
              <label>Price
                <input type='text' name='price' placeholder={this.props.config.flare.price} onChange={this.handleChange}/>
              </label>
          </div>
          <div className="halfColumn">
            <h3>Local Node</h3>
            <label>IP Address
              <input type='text' name='local.ip' placeholder={this.props.config.flare.local.ip} onChange={this.handleChange}/>
            </label>
            <label>Port
              <input type='text' name='local.port' placeholder={this.props.config.flare.local.port} onChange={this.handleChange}/>
            </label>
          </div>
          <div className="halfColumn">
            <h3>Master Node</h3>
            <label>IP Address
              <input type='text' name='master.ip' placeholder={this.props.config.flare.master.ip} onChange={this.handleChange}/>
            </label>
            <label>Port
              <input type='text' name='master.port' placeholder={this.props.config.flare.master.port} onChange={this.handleChange}/>
            </label>
          </div>
        </form>
      </div>
    )
  },
  componentDidMount () {
    this.setState(this.props.config)
  },
})

var Spark = React.createClass({
  handleChange: function (event) {
    var newState = this.state
    if(event.target.value == '') {
      newState[event.target.name] = event.target.placeholder
      this.props.config.flare[event.target.name] = event.target.placeholder
    }else {
      newState[event.target.name] = event.target.value
      this.props.config.flare[event.target.name] = event.target.value
    }
    this.setState(newState)
    ws.send(JSON.stringify({flag: 'setConfig', fields: this.props.config}))
  },
  render: function () {
    return (
      <div>
        <h2>Spark</h2>
        <form>
          <div className="halfColumn">
            <label>Directory
              <input type='text' name='directory' placeholder={this.props.config.spark.directory} onChange={this.handleChange}/>
            </label>
          </div>
          <div  className="fullColumn">
            <h3>Master Settings</h3>
            <div className="halfColumn">
              <label>IP
                <input type='text' name='master.ip' placeholder={this.props.config.spark.master.ip} onChange={this.handleChange}/>
              </label>
              <label>Port
                <input type='text' name='master.port' placeholder={this.props.config.spark.master.port} onChange={this.handleChange}/>
              </label>
            </div>
            <div className="halfColumn">
              <label>Memory allowed
                <input type='text' name='receiverMemory' placeholder={this.props.config.spark.receiverMemory} onChange={this.handleChange}/>
              </label>
              <label>Cores Allowed
                <input type='text' name='cores' placeholder={this.props.config.spark.cores} onChange={this.handleChange}/>
              </label>
            </div>
          </div>
          <div className="fullColumn">
            <h3>Logging Settings</h3>
            <h4>Changing the disabled options may break Flare</h4>
            <div className="halfColumn">
              <label>Root Category
                <input type='text' name='log4j.rootCategory' placeholder={this.props.config.spark.log4j.rootCategory} disabled/>
              </label>
              <label>Appender
                <input type='text' name='log4j.appender' placeholder={this.props.config.spark.log4j.appender} disabled/>
              </label>
              <label>Directory
                <input type='text' name='log4j.directory' placeholder={this.props.config.spark.log4j.directory} onChange={this.handleChange}/>
              </label>
            </div>
            <div className="halfColumn">
              <label>Max File Size
                <input type='text' name='log4j.maxFileSize' placeholder={this.props.config.spark.log4j.maxFileSize} onChange={this.handleChange}/>
              </label>
              <label>Layout
                <input type='text' name='log4j.layout' placeholder={this.props.config.spark.log4j.layout} disabled/>
              </label>
              <label>Conversion Pattern
                <input type='text' name='log4j.conversionPattern' placeholder={this.props.config.spark.log4j.conversionPattern} disabled/>
              </label>
            </div>
          </div>
        </form>
      </div>
    )
  }
})

var Cassandra = React.createClass({
  handleChange: function (event) {
    var newState = this.state
    if(event.target.value == '') {
      newState[event.target.name] = event.target.placeholder
      this.props.config.flare[event.target.name] = event.target.placeholder
    }else {
      newState[event.target.name] = event.target.value
      this.props.config.flare[event.target.name] = event.target.value
    }
    this.setState(newState)
    ws.send(JSON.stringify({flag: 'setConfig', fields: this.props.config}))
  },
  render: function () {
    return (
      <div>
        <h2>Cassandra</h2>
        <form>
          <div className="halfColumn">
            <label>Directory
              <input type='text' name='directory' placeholder={this.props.config.cassandra.directory} onChange={this.handleChange}/>
            </label>
            <label>Username
              <input type='text' name='username' placeholder={this.props.config.cassandra.username} onChange={this.handleChange}/>
            </label>
            <label>Password
              <input type='text' name='password' placeholder={this.props.config.cassandra.password} onChange={this.handleChange}/>
            </label>
          </div>
          <div className="halfColumn">
            <label>IP Address
              <input type='text' name='ip' placeholder={this.props.config.cassandra.ip} onChange={this.handleChange}/>
            </label>
            <label>Port
              <input type='text' name='port' placeholder={this.props.config.cassandra.port} onChange={this.handleChange}/>
            </label>
          </div>
        </form>
      </div>
    )
  },
})

var Settings = React.createClass({
  getInitialState: function () {
    return initialConfig
  },
  componentDidMount: function () {
    ws.addCallback('getConfig', (message) => {
      this.setState(message)
    })
    ws.send(JSON.stringify({flag: 'getConfig'}))
  },
  render: function () {
    return (
      <div id="settings-page" className="page">
        <Navbar/>
        <Sidebar path={window.location.pathname}/>
        <div className='container'>
          <h1>Settings</h1>
          <Flare config={this.state}/>
          <Spark config={this.state}/>
          <Cassandra config={this.state}/>
        </div>
      </div>
    )
  },
})

export default Settings;