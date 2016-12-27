import React from 'react';

let Sidebar = React.createClass({
  checkPath: function (id) {
    if(this.props.path == id) {
      return 'link active';
    }
    else {
      return 'link';
    }
  },
  render: function () {
    return (
      <div id='sidebar'>
        <a className='navbar-brand' href='/'>
          <img src="/images/logo.png" alt="Flare logo" height="50" width="140" />
        </a>
        <ul>
          <li>
            <a className={this.checkPath("/connections")} href="/connections">
              <span className='icon fa fa-globe' aria-hidden='true'></span>
              Connections
            </a>
          </li>

          <li>
            <a className={this.checkPath("/submit")} href="/submit">
              <span className='icon fa fa-cloud-upload' aria-hidden='true'></span>
              Submit
            </a>
          </li>

          <li>
            <a className={this.checkPath("/settings")} href="/settings">
              <span className='icon fa fa-cloud-download' aria-hidden='true'></span>
              Settings
            </a>
          </li>

          <li>
            <a className={this.checkPath("/logs")} href="/logs">
              <span href="/logs" className='icon fa fa-list' aria-hidden='true'></span>
              Logs
            </a>
          </li>

        </ul>
      </div>
    )
  }
})

let Navbar = React.createClass({
  render: function () {
    // Hardcoded Balance, need lightwallet integration
    return (
      <nav id='navbar'>
        <div id='etherBalance'>10,000,000 ETH</div>
        <a href='https://github.com/lumichael94/flare'
          id='github' className='fa fa-github'>Github Repository</a>
      </nav>
    );
  }
});

let IncludeTemplate = React.createClass({
  componentDidMount: function () {
    var componentRoot = React.findDOMNode(this);
    var parentNode = componentRoot.parentNode;
    parentNode.removeChild(componentRoot);
    return Blaze.render(this.props.template, parentNode);
  },
  render: function (template) {
    return (<div />)
  },
})

let wsCallbacks = {
  sparkNodeInfo: [],
  cassandraNodeInfo: [],
  ipfsNodeInfo: [],
  sparkConnections: [],
  cassandraConnections: [],
  ipfsConnections: [],
  getLog: [],
  config: [],
  submit: [],
}

let ws = new WebSocket('ws://localhost:35273')
ws.onmessage = (message) => {
  message = JSON.parse(message.data);
  console.log(message);
  if(message.flag) {
    wsCallbacks[message.flag].forEach((callback) => {
      callback(message.data);
    });
  }
  // if(wsCallbacks[message.uniqueIdent]) {
  //   wsCallbacks[message.uniqueIdent](this, data);
  //   delete wsCallbacks[message.uniqueIdent];
  // }
};

ws.addCallback = (type, callback) => {
  wsCallbacks[type].push(callback)
}

export {Navbar, Sidebar, IncludeTemplate, ws}