/*eslint no-console:0 */
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');

new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:' + config.port);
  console.log('Opening your system browser...');
  open('http://localhost:' + config.port + '/webpack-dev-server/');
});



const ESPlugin = require('./lib/suQL/src/plugins/elasticsearch/')
const dataInfo = require('./src/sources/config_json.json')

var express = require('express');
var app = express();
const TextTileHTTP = require('./lib/suQL/src/TextTileHTTP')(dataInfo.mapping, new ESPlugin(dataInfo.config));

//Create endpoint
app.use('/q', TextTileHTTP);

app.get('/', function (req, res) {
    res.send('Working');
});

let port = 7000
app.listen(port, function () {
    console.log(`Server Listening on port ${port}!`);
});
