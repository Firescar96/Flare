import React from 'react';
require('../sass/home.scss');

let navbar = (
  <nav>
    <h1>React Boilerplate</h1>
  </nav>
);

var Home = React.createClass({
  render () {
    return (
      <div>
        {navbar}

        <main>
          this is not a website
        </main>

      </div>
    );
  },
});

export default Home;