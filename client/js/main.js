import Home from './Home.js';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';

$(function () {
  render((
    <Router history={browserHistory}>
      <Route path="*" component={Home}/>
    </Router>
  ), document.getElementById('root'));
});