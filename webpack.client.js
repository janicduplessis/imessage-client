var webpack = require('webpack');
var path = require('path');

module.exports = {
  target: 'web',
  cache: false,
  context: __dirname,
  devtool: false,
  entry: ['./src/client/client'],
  output: {
    path: path.join(__dirname, 'static/dist'),
    filename: 'client.js',
    chunkFilename: '[name].[id].js',
    publicPath: 'dist/',
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ],
  module: {
    loaders: [
      {include: /\.json$/, loaders: ['json-loader']},
      {include: /\.js$/, loaders: ['babel-loader?stage=1&optional=runtime'], exclude: /node_modules/},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.scss$/, loader: 'style!css!sass'},
    ],
  },
  resolve: {
    modulesDirectories: [
        'src',
        'node_modules',
        'web_modules',
      ],
      extensions: ['', '.json', '.js'],
  },
  node: {
    __dirname: true,
    fs: 'empty',
  },
};
