

exports.deploy = function(server, localFile, deployComplete) {    
    var conf = require('./config');
    server = server || conf.defaults.connection || Object.keys(conf.connections)[0];

    var serverOptions = conf.connections[server];

    if(!serverOptions) { if(callback) callback(); }


    var path = require('path')
    
    var fileExt = path.extname(localFile);
    var fileName = path.basename(localFile, fileExt);

    console.log("create")
    this.createFolder(serverOptions, fileName, () => {
        console.log("upload")
        this.uploadFile(serverOptions, fileName, localFile, () => {
            if(fileExt === '.zip') {
                console.log("unzip")
                this.unzipFile(serverOptions, fileName + "/" + fileName + fileExt, () => {
                   this.deleteFile(serverOptions, fileName + "/" + fileName + fileExt, () => {
                        if(deployComplete) deployComplete();        
                    });
                });
            } else {
                if(deployComplete) deployComplete();
            }
        });
    });
}

exports.createFolder = function(serverOptions, folder, callback) {
    const https = require('https');
    const utils = require('./utils')
    const fs = require('fs')

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + folder,
        method: 'MKCOL',
        ca: fs.readFileSync(utils.rootDir('certs') + serverOptions.servercert),
        cert: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.certpath),
        key: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.keypath),
        passphrase: utils.decrypt(serverOptions.privatekey.password, serverOptions.username),
        port: 443,
        auth: serverOptions.username + ':' + utils.decrypt(serverOptions.password, serverOptions.username),
        requestCert: true,
        rejectUnauthorized: false
    }    

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
        res.on('end', () => {
            if(callback) callback();  
        });        
    });

    req.on('error', (e) => {
        console.log(e);
    });
    req.end();

}

exports.uploadFile = function (serverOptions, remotePath, localFile, callback) {
    var fs = require('fs');
    var path = require('path');
    const https = require('https');
    var mime = require('mime');
    const utils = require('./utils');
    
    var filename = path.basename(localFile);
    var type = mime.lookup(localFile);

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remotePath + '/' + filename,
        method: 'PUT',
        ca: fs.readFileSync(utils.rootDir('certs') + serverOptions.servercert),
        cert: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.certpath),
        key: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.keypath),
        passphrase: utils.decrypt(serverOptions.privatekey.password, serverOptions.username),
        port: 443,
        auth: serverOptions.username + ':' + utils.decrypt(serverOptions.password, serverOptions.username),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': type
        }        
    }

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
        res.on('end', () => {
            if(callback) callback();  
        });
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.write(fs.readFileSync(localFile));
    req.end();      
}

exports.unzipFile = function(serverOptions, remoteFile, callback) {
    const https = require('https');
    const utils = require('./utils');
    var fs = require('fs');

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remoteFile,
        method: 'POST',
        ca: fs.readFileSync(utils.rootDir('certs') + serverOptions.servercert),
        cert: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.certpath),
        key: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.keypath),
        passphrase: utils.decrypt(serverOptions.privatekey.password, serverOptions.username),
        port: 443,
        auth: serverOptions.username + ':' + utils.decrypt(serverOptions.password, serverOptions.username),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }    
    }

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
        res.on('end', () => {
            if(callback) callback();  
        });        
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.write('method=UNZIP');
    req.end();  
}


exports.deleteFile = function(serverOptions, remoteFile, callback) {
    const https = require('https');
    const utils = require('./utils');
    var fs = require('fs');

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remoteFile,
        method: 'DELETE',
        ca: fs.readFileSync(utils.rootDir('certs') + serverOptions.servercert),
        cert: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.certpath),
        key: fs.readFileSync(utils.rootDir('certs') + serverOptions.privatekey.keypath),
        passphrase: utils.decrypt(serverOptions.privatekey.password, serverOptions.username),
        port: 443,
        auth: serverOptions.username + ':' + utils.decrypt(serverOptions.password, serverOptions.username),
        requestCert: true,
        rejectUnauthorized: false  
    }

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
        res.on('end', () => {
            if(callback) callback();  
        }); 
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.end();  
}