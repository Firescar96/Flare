import React from 'react';
import {Navbar, Sidebar, ws} from './globals'
require('../sass/home.scss');

var Spark = React.createClass({
  getInitialState: function () {
    return {
      status: 'Not Connected',
      workers: 'N/A',
      url: 'N/A',
      applications: 'N/A'
    }
  },
  componentDidMount: function () {
    ws.addCallback('sparkNodeInfo', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    return (
      <div>
        <h2>Spark</h2>
        <div className='infobox'>
          <div>
            <h3>Local Status: </h3>
            <span>{this.state.status}</span>
          </div>
          <div>
            <h3>Connected Workers: </h3>
            <span>{this.state.workers}</span>
          </div>
          <div>
            <h3>Public Address: </h3>
            <span>{this.state.url}</span>
          </div>
          <div>
            <h3>Running Applications: </h3>
            <span>{this.state.applications}</span>
          </div>
        </div>
      </div>
    )
  }
});
var Cassandra = React.createClass({
  getInitialState: function () {
    return {
      ID: 'N/A',
      gossipActive: 'No',
      thriftActive: 'No',
      uptime: 'N/A',
      heapMemory: 'N/A'
    }
  },
  componentDidMount: function () {
    ws.addCallback('cassandraNodeInfo', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    return (
      <div>
        <h2>Cassandra</h2>
        <div className='infobox'>
          <div>
            <h3>Peer ID: </h3>
            <span>{this.state.ID}</span>
          </div>
          <div>
            <h3>Gossip Active: </h3>
            <span>{this.state.gossipActive}</span>
          </div>
          <div>
            <h3>Thrift Active: </h3>
            <span>{this.state.thriftActive}</span>
          </div>
          <div>
            <h3>Uptime: </h3>
            <span>{this.state.uptime}</span>
          </div>
          <div>
            <h3>Heap Memory (MB): </h3>
            <span>{this.state.heapMemory}</span>
          </div>
        </div>
      </div>
    )
  }
});
var IPFS = React.createClass({
  getInitialState: function () {
    return {
      id: 'N/A',
      status: 'Not connected',
      publicKey: 'N/A'
    }
  },
  componentDidMount: function () {
    ws.addCallback('ipfsNodeInfo', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    return (
      <div>
        <h2>IPFS</h2>
        <div className='infobox'>
          <div>
            <h3>ID: </h3>
            <span>{this.state.id}</span>
          </div>
          <div>
            <h3>Status: </h3>
            <span>{this.state.status}</span>
          </div>
          <div>
            <h3>Public Key: </h3>
            <span>{this.state.publicKey}</span>
          </div>
        </div>
      </div>
    )
  }
});

var Home = React.createClass({
  render: function () {
    return (
      <div id='home-page' className='page'>
        <Navbar/>
        <Sidebar path={window.location.pathname}/>
        <div className='container'>
          <h1>Welcome to Project: FLARE</h1>
          <Spark/>
          <Cassandra/>
          <IPFS/>
        </div>
      </div>
    )
  }
});

export default Home;