exports.createFolder = function(serverOptions, folder, callback) {
    const https = require('https');

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + folder,
        method: 'MKCOL',
        ca: serverOptions.ca,
        cert: serverOptions.cert,
        key: serverOptions.key,
        passphrase: serverOptions.passphrase,
        port: 443,
        auth: serverOptions.user + ':' + serverOptions.pass,
        requestCert: true,
        rejectUnauthorized: false
    }

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (e) => {
        console.log(e);
    });

    d  

    if(callback) callback();  
}

exports.uploadFile = function (serverOptions, remotePath, localFile, callback) {
    var fs = require('fs');
    var path = require('path');
    const https = require('https');
    var mime = require('mime');

    var filename = path.basename(localFile);
    var type = mime.lookup(localFile);

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remotePath + '/' + filename,
        method: 'PUT',
        ca: serverOptions.ca,
        cert: serverOptions.cert,
        key: serverOptions.key,
        passphrase: serverOptions.passphrase,
        port: 443,
        auth: serverOptions.user + ':' + serverOptions.pass,
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
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.write(fs.readFileSync(localFile));
    req.end();  

    if(callback) callback();  
}

exports.unzipFile = function(serverOptions, remoteFile, callback) {
    const https = require('https');

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remoteFile,
        method: 'POST',
        ca: serverOptions.ca,
        cert: serverOptions.cert,
        key: serverOptions.key,
        passphrase: serverOptions.passphrase,
        port: 443,
        auth: serverOptions.user + ':' + serverOptions.pass,
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
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.write('method=UNZIP');

    req.end();  

    if(callback) callback();  
}


exports.deleteFile = function(serverOptions, remoteFile, callback) {
    const https = require('https');

    var opt = {
        host: serverOptions.host,
        path: '/on/demandware.servlet/webdav/Sites/Cartridges/' + remoteFile,
        method: 'DELETE',
        ca: serverOptions.ca,
        cert: serverOptions.cert,
        key: serverOptions.key,
        passphrase: serverOptions.passphrase,
        port: 443,
        auth: serverOptions.user + ':' + serverOptions.pass,
        requestCert: true,
        rejectUnauthorized: false  
    }

    const req = https.request(opt, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (e) => {
        console.log(e);
    });

    req.end();  

    if(callback) callback();  
}