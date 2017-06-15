exports.clean = function() {
    var fs = require('fs');
    var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
        });
        fs.rmdirSync(path);
    }
    };

    if(fs.existsSync('./working')) {
        deleteFolderRecursive('./working')
    }
}

exports.encrypt = function(text,pass){
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';    
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
 
exports.decrypt = function(text,pass){
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';    
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

exports.buildnumber = function() {
    return Date.now().toString();
}

exports.findDirectory = function(parent, name, pathFound) {
    var fs = require('fs');
    var path = require('path');
    var find = require('./utils').findDirectory

    var dirs = fs.readdirSync(parent);
    
    for(var d=0;d<dirs.length;d++) {
        var dir = dirs[d];        
        if(dir == name && pathFound) {
            pathFound(parent + path.sep + dir);
            return true;
        } else {            
            var stat = fs.statSync(parent + path.sep + dir)
            if(stat.isDirectory()) {                
                var res = find(parent + path.sep + dir, name, pathFound);
                if(res) return res;
            }            
        }
    }
}