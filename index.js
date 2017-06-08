var fs = require('fs');
const https = require('https');
var dw = require('./dwdav');
var git = require('./git');
var conf = require('./config.json');

var serverOptions = {
    host: conf.demandware.server,
    ca: fs.readFileSync(conf.demandwares.servercert),
    cert: fs.readFileSync(conf.demandware.privatekey.certpath,'utf8'),
    key: fs.readFileSync(conf.demandware.privatekey.keypath,'utf8'),
    passphrase: conf.demandware.privatekey.password,
    user: conf.demandware.username,
    pass: conf.demandware.password  
}

var repoOptions = {
    repo: conf.repos.mikgit.url,
    privateKey: conf.repos.mikgit.ssh.privatekey,
    publicKey: conf.repos.mikgit.ssh.publickey,
    passphrase: conf.repos.mikgit.ssh.password,
    branch: conf.repos.mikgit.branch
}

git.clone(repoOptions);

//dw.createFolder(serverOptions, 'HelloAaron')
//dw.uploadFile(serverOptions, 'HelloAaron', './categories.zip')
//dw.deleteFile(serverOptions, 'HelloAaron/categories.zip')