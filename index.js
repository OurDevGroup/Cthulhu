var fs = require('fs');
const https = require('https');
var dw = require('./dwdav');
var git = require('./git');
var conf = require('./config'); //see config.json.sample on how to build this file

var util = require('./utils')

util.findDirectory('./working', 'static', (path) => {
console.log(path)
});