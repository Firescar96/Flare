import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import Home from './Home.js';
import Connections from './Connections.js';
import Submit from './Submit';
import Settings from './Settings.js';
import Logs from './Logs.js';

let Sidebar = React.createClass({
  checkPath: function (id) {
    if(this.props.path == id) {
      return 'link active';
    }
    return 'link';
  },
  render: function () {
    return (
      <div id='sidebar'>
        <a className='navbar-brand' href='/'>
          <img src='/images/logo.png' alt='Flare logo' height='50' width='140' />
        </a>
        <ul>
          <li>
            <a className={this.checkPath('/connections')} href='/connections'>
              <span className='icon fa fa-globe' aria-hidden='true'></span>
              Connections
            </a>
          </li>

          <li>
            <a className={this.checkPath('/submit')} href='/submit'>
              <span className='icon fa fa-cloud-upload' aria-hidden='true'></span>
              Submit
            </a>
          </li>

          <li>
            <a className={this.checkPath('/settings')} href='/settings'>
              <span className='icon fa fa-cloud-download' aria-hidden='true'></span>
              Settings
            </a>
          </li>

          <li>
            <a className={this.checkPath('/logs')} href='/logs'>
              <span href='/logs' className='icon fa fa-list' aria-hidden='true'></span>
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

$(function () {
  render((
    <Router history={browserHistory}>
      <Route path='/connections' component={Connections}/>
      <Route path='/submit' component={Submit}/>
      <Route path='/settings' component={Settings}/>
      <Route path='/logs' component={Logs}/>
      <Route path='*' component={Home}/>
    </Router>
  ), document.getElementById('root'));
});

export {Navbar, Sidebar, IncludeTemplate}