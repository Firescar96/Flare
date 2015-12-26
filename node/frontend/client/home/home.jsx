Meteor.startup( function(){
  Router.route('/', function () {
    this.render('home');
  })

  Template.home.rendered = function() {
    var Spark = React.createClass({
      getInitialState: function() {
        return {
          status: "Not Connected",
          workers: "N/A",
          url: "N/A",
          applications: "N/A"
        }
      },
      componentDidMount: function() {
        var self = this
        Meteor.subscribe("spark", function() {
          Tracker.autorun(function () {
            var info = SparkDB.findOne()
            if(info && info["Status"])
            self.setState({
              status: info["Status"],
              workers: info["Workers"],
              url: info["URL"],
              applications: info["Applications"]
            })
          })
        })
      },
      render: function(){
        return(
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
      getInitialState: function() {
        return {
          ID: "N/A",
          gossipActive: "No",
          thriftActive: "No",
          uptime: "N/A",
          heapMemory: "N/A"
        }
      },
      componentDidMount: function() {
        var self = this
        Meteor.subscribe("cassandra", function() {
          Tracker.autorun(function () {
            var info = CassandraDB.findOne()
            if(info)
            self.setState({
              ID: info["ID"],
              gossipActive: info["gossipActive"],
              thriftActive: info["thriftActive"],
              uptime: info["uptime"],
              heapMemory: info["heapMemory"]
            })
          })
        })
      },
      render: function(){
        return(
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
      getInitialState: function() {
        return {
          id: "N/A",
          status: "Not connected",
          publicKey: "N/A"
        }
      },
      componentDidMount: function() {
        var self = this
        Meteor.subscribe("ipfs", function() {
          Tracker.autorun(function () {
            var info = IPFSDB.findOne()
            console.log(JSON.stringify(info) + "inof");
            if(info && typeof info.id != "undefined")
              self.setState({
                id: info.id,
                status: info.status,
                publicKey: info.publicKey
              })
          })
        })
      },
      render: function(){
        return(
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
      render: function(){
        return (
          <div id="home-page" className="page">
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


    React.render(<Home />, document.body)
  }

})
