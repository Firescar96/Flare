import React from 'react';
import {Navbar, Sidebar, ws} from './globals'
import classnames from 'classnames'
require('../sass/logs.scss');

const SPARK_LOG = 'sparkLog'
const SPARK_UI_LOG = 'sparkUILog'
const TRACING_LOG = 'cassandraTracingLog'
const SESSION_LOG = 'cassandraSessionLog'

var Logs = React.createClass({
  getInitialState: function () {
    return {
      currentLog: '',
      sparkLog: '',
      sparkUILog: '',
      cassandraTracingLog: '',
      cassandraSessionLog: '',
    }
  },
  componentDidMount: function () {
    ws.addCallback('getLog', (message) => {
      var update = {};
      update[message.type] = message.text;
      console.log('got an update: ' + JSON.stringify(update));
      this.setState(update);
    })
  },
  changeLog (event) {
    this.setState({currentLog: event.target.value});
    ws.send(JSON.stringify({flag: 'getLog', type: event.target.value}));
  },
  render: function () {
  console.log("classnames: " + classnames({hide: !(this.state.currentLog.localeCompare(SESSION_LOG) == 0)}));
    return (
      <div id='logs-page' className='page'>
        <Navbar/>
        <Sidebar path={window.location.pathname}/>
        <h1>Logs</h1>
        <div id='log-select' className='row text-center'>
          <label htmlFor={SPARK_UI_LOG}>
            <input id={SPARK_UI_LOG} name='logtype' type='radio' value={SPARK_UI_LOG}
              checked={this.state.currentLog.localeCompare('sparkLogUILog') === 0 ? 'checked' : ''}
              onChange={this.changeLog}/>
            <span>Spark UI</span>
          </label>
          <label htmlFor={SPARK_LOG}>
            <input id={SPARK_LOG} name='logtype' type='radio' value={SPARK_LOG}
              checked={this.state.currentLog.localeCompare(SPARK_LOG) === 0 ? 'checked' : ''}
              onChange={this.changeLog}/>
            <span>Spark</span>
          </label>
          <label htmlFor={TRACING_LOG}>
            <input id={TRACING_LOG} name='logtype' type='radio' value={TRACING_LOG}
              checked={this.state.currentLog
                .localeCompare(TRACING_LOG) === 0 ? 'checked' : ''}
              onChange={this.changeLog}/>
            <span>Tracing</span>
          </label>
          <label htmlFor={SESSION_LOG}>
            <input id={SESSION_LOG} name='logtype' type='radio' value={SESSION_LOG}
              checked={this.state.currentLog
                .localeCompare(SESSION_LOG) === 0 ? 'checked' : ''}
              onChange={this.changeLog}/>
            <span>Session</span>
          </label>
        </div>

        <div id='logData'>
        <div className={classnames({hide: !(this.state.currentLog
            .localeCompare(SPARK_UI_LOG) == 0)})}>
            {this.state.sparkUILog}
          </div>
          <div className={classnames({hide: !(this.state.currentLog
              .localeCompare(SPARK_LOG) == 0)})}>
            {this.state.sparkLog}
          </div>
          <div className={classnames({hide: !(this.state.currentLog
              .localeCompare(TRACING_LOG) == 0)})}>
            {this.state.cassandraTracingLog}
          </div>
          <div className={classnames({hide: !(this.state.currentLog
              .localeCompare(SESSION_LOG) == 0)})}>
            {this.state.cassandraSessionLog}
          </div>
        </div>
      </div>
    )
  },
})

export default Logs;