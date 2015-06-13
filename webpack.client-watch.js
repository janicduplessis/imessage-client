var webpack = require('webpack');
var config = require('./webpack.client.js');

config.cache = true;
config.debug = true;
config.devtool = 'source-map';

config.entry.unshift(
  'webpack-dev-server/client?http://localhost:8081',
  'webpack/hot/only-dev-server'
);

config.output.publicPath = 'http://localhost:8081/dist/';
config.output.hotUpdateMainFilename = 'update/[hash]/update.json';
config.output.hotUpdateChunkFilename = 'update/[hash]/[id].update.js';

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
];

config.module = {
  loaders: [
    {include: /\.json$/, loaders: ['json-loader']},
    {include: /\.js$/, loaders: ['react-hot', 'babel-loader?stage=1&optional=runtime'], exclude: /node_modules/},
    {test: /\.css$/, loader: 'style!css'},
    {test: /\.scss$/, loader: 'style!css!sass'},
  ],
};

config.devServer = {
  publicPath: 'http://localhost:8081/dist/',
  contentBase: './static',
  hot: true,
  inline: true,
  lazy: false,
  quiet: true,
  noInfo: false,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true},
  host: '0.0.0.0',
  port: 8081,
};

module.exports = config;
