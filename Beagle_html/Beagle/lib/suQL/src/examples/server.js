var express = require('express');
var app = express();

//Create a connection
const ESPlugin = require('../plugins/elasticsearch/')
const dataInfo = require('./config_json.json')
const TextTileHTTP = require('../TextTileHTTP')(dataInfo.mapping, new ESPlugin(dataInfo.config));

//Create endpoint
app.use('/q', TextTileHTTP);

app.get('/', function (req, res) {
    res.send('Working');
});

let port = 7001
app.listen(port, function () {
    console.log(`Server Listening on port ${port}!`);
});
