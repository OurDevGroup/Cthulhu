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

    if(fs.existsSync(this.workingDir())) {
        deleteFolderRecursive(this.workingDir())
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

exports.buildNumber = function() {
    var x = Date.now().toString();
    return x;
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

 exports.ensureDirectoryExistence = function (filePath) {     
    var path = require('path'),
        fs = require('fs');
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    require('./utils').ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

exports.getAllFiles = function(inpath) {
        var paths = [];
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync(inpath);        
        for(var i=0;i<files.length;i++) {
            var file = files[i];            
            var stat = fs.statSync(inpath + path.sep + file);
            if(stat.isDirectory()) {
                paths = paths.concat(require('./util').getAllFiles(inpath + path.sep + file))
            }
            paths.push(inpath + path.sep + file);
        }
        return paths;
};

exports.workingDir = function() {
    var x = this.rootDir('working');
    return x;
}

exports.buildDir = function() {
    var x = this.rootDir('build');
    return x;
}

exports.rootDir = function(name) {
    var path  = require('path');
    var fs = require('fs');
    var dir = __dirname;
    if(fs.existsSync(dir + path.sep + 'node_modules')) {
        this.ensureDirectoryExistence(dir + path.sep + name + path.sep)
        return dir + path.sep + name + path.sep;
    } else {
        var pathParts = dir.split(path.sep);
        dir = '';
        
        for (var i = 0, len = pathParts.length-1; i<len; i++){
            if(pathParts[i].length > 0)
                dir += path.sep + pathParts[i];
        }

        this.ensureDirectoryExistence(dir + path.sep + name + path.sep)
        return dir + path.sep + name + path.sep;
    }
}