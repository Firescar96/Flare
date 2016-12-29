import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import Home from './Home.js';
import ViewDApps from './ViewDApps.js';
import EditDApps from './EditDApps.js';
import EditNodes from './EditNodes.js';
import ViewNodes from './ViewNodes.js';

$(function () {

  // React.render(<Header/>, $('#headerContent')[0])
  render((
    <Router history={browserHistory}>
      <Route path="/dapps">
        <Route path="view" component={ViewDApps} />
        <Route path="edit" component={EditDApps} />
      </Route>
      <Route path="/nodes">
        <Route path="edit" component={EditNodes} />
        <Route path="view" component={ViewNodes} />
      </Route>
      <Route path='*' component={Home} />
    </Router>
  ), document.getElementById('root'));
});