import React from 'react';
import {Navbar, Sidebar, ws} from './globals'
require('../sass/connections.scss');

var SparkConnect = React.createClass({
  getInitialState: function () {
    return {master: {}, nodes: []}
  },
  componentDidMount: function () {
    ws.addCallback('sparkConnections', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    var nodeTable = this.state.nodes.map(function (node) {
      return (
        <tr>
          <td>{node.ID}</td>
          <td>{node.address}</td>
          <td>{node.state}</td>
          <td>{node.cores}</td>
          <td>{node.memory}</td>
        </tr>
      )
    })
    return (
      <div>
        <h2>Spark</h2>
        <div className='infobox'>
          <div>
            <h3>Master: </h3>
            <span>{this.state.master.address}</span>
          </div>
          <div>
            <h3>Workers: </h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>State</th>
                  <th>Cores</th>
                  <th>Memory</th>
                </tr>
              </thead>
              <tbody>
                {nodeTable}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  },
});

var CassandraConnect = React.createClass({
  getInitialState: function () {
    return {data: []}
  },
  componentDidMount: function () {
    ws.addCallback('cassandraConnections', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    var nodeTable = this.state.data.map(function (node) {
      return (
        <tr>
          <td>{node.address}</td>
          <td>{node.status}</td>
          <td>{node.state}</td>
          <td>{node.owns}</td>
          <td>{node.token}</td>
        </tr>
      )
    })
    return (
      <div>
        <h2>Cassandra</h2>
        <div className='infobox'>
          <h3>Top Peers: </h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Status</th>
                <th>State</th>
                <th>Owns</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              {nodeTable}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
});

var IPFSConnect = React.createClass({
  getInitialState: function () {
    return {data: []}
  },
  componentDidMount: function () {
    ws.addCallback('ipfsConnections', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    var nodeTable = this.state.data.map(function (node) {
      return (
        <tr>
          <td>{node}</td>
        </tr>
      )
    })
    return (
      <div>
        <h2>IPFS</h2>
        <div className='infobox'>
          <h3>Top Peers: </h3>
          <table>
            <thead>
              <tr><th>Peer ID</th></tr>
            </thead>
            <tbody>
              {nodeTable}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
});

var Connections = React.createClass({
  render: function () {
    return (
      <div id="connections-page" className="page">
        <Navbar/>
        <Sidebar path={window.location.pathname}/>
        <div className="container">
          <h1>Connections</h1>
          <SparkConnect/>
          <CassandraConnect/>
          <IPFSConnect/>
        </div>
      </div>
    )
  },
});

export default Connections;
