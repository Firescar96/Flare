import React from 'react';
import {Navbar, Sidebar, ws} from './globals'
import classnames from 'classnames'
require('../sass/submit.scss');

var Submit = React.createClass({
  getInitialState: function () {
    return {
      hash: '',
      progress: 0,
      state: '',
    }
  },
  componentDidMount: function (argument) {
    ws.addCallback('submit', (message) => {
      this.setState(message)
    })
  },
  render: function () {
    return (
      <div id="submit-page" className="page">
        <Navbar/>
        <Sidebar path={window.location.pathname}/>
        <div className='container'>
          <h1>Submit</h1>
          <div id='uploadJar'>
            <h2>Upload Jar</h2>
              <iframe name="submitFrame" style={{display: 'none'}}></iframe>
              <form id="uploadForm" encType="multipart/form-data"
                action="/submit" method="post" target="submitFrame">
            		<label>
                  "Don't know what goes here"
                	<input type="file" name="upload"/>
            		</label>
                <div>
              		<button id="upload" type="submit">StartUpload</button>
                </div>
                <div id="progressBox">
                  <span>{this.state.progress}</span>
                  <span id="progressBar"
                    className={classnames({
                      completed: this.state.state.localeCompare('completed') == 0,
                      failed: this.state.state.localeCompare('failed') == 0,
                    })}
                    style={{width: this.state.progress + '%'}}></span>
                </div>
              </form>
          </div>
          <div id="ipfsHash">
            <h2>IPFS Hash: <span id="hash">{this.state.hash}</span></h2>
          </div>
        </div>
      </div>
    )
  }
});

export default Submit;

