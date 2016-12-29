var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    main:  './client/js/main.js',
    web3:  './node_modules/web3/index.js',
  },
  output: {
    path:     './public/',
    filename: 'js/[name].js' //Template based on keys in entry above
  },
  module: {
    loaders: [
      {
        test:    /\.js$/,
        exclude: /(node_modules)/,
        loader:  'babel',
        query:   {
          presets: ['es2015', 'react'],
        },
      },
      {
        test:    /\.json$/,
        loader:  'json',
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'style', // The backup style loader
          'css?sourceMap!sass?sourceMap'
        )
      },
    ],
  },
  sassLoader: {
    includePaths: [ './client/sass' ]
  },
  plugins: [
    new ExtractTextPlugin("style/[name].css")
  ],
};
