var fs = require('fs');
const https = require('https');
var dw = require('./dwdav');
var git = require('./git');
var conf = require('./config'); //see config.json.sample on how to build this file

conf.delete('repos:node-archiver')
var x = conf.read('repos:node-archiver')
console.log (x)