Meteor.startup( function(){
  Router.route('/submit', function () {
    this.render('submit');
  });


  Template.submit.rendered = function() {
    var Submit = React.createClass({
      getInitialState: function() {
        return {
          hash: ""
        }
      },
      componentDidMount: function(argument) {
        var self = this
        Meteor.subscribe("jars", function() {
          Tracker.autorun(function () {
            JARSDB.find().observeChanges({
              changed: function(id, fields) {
                self.setState(fields)
              }
            })
          })
        })
      },
      render: function(){
        return(
          <div id="submit-page" className="page">
            <Navbar/>
            <Sidebar path={window.location.pathname}/>
            <div className='container'>
              <h1>Submit</h1>
              <div id='uploadJar'>
                <h2>Upload Jar</h2>
                <IncludeTemplate template={Template.uploadForm} />
              </div>
              <div id="ipfsHash">
                <h2>IPFS Hash: <span id="hash">{this.state.hash}</span></h2>
              </div>
            </div>
          </div>
        )
      }
    });

    React.render(<Submit />, document.body)
  }
})
