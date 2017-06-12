var conf = require("./config.json");

exports.zipDirectories = function(zipname, callback) {
    var fs = require('fs');
    var dir = __dirname + '/build/';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    zipname = zipname || require('./utils').buildnumber();

    var fs = require('fs');
    var archiver = require('archiver');
    var outfile = '/build/' + zipname + '.zip';
    var output = fs.createWriteStream(__dirname + outfile);
    var archive = archiver('zip', {
        zlib: { level: 9 },
        store: true
    });

    output.on('close', function() {
        if(callback) callback(outfile);
    });
    
    archive.on('error', function(err) {
        throw err;
    });
 
    archive.pipe(output);

    var keys = Object.keys(conf.cartridges);
    for (var i = 0,length = keys.length; i < length; i++) {
        var cart = conf.cartridges[keys[i]];
        if(Array.isArray(cart) && cart.length > 0) {
            for(var c=0;c<cart.length;c++) {
                var cartDef = cart[c];
                if(cartDef.files) {
                    for(var f=0;f<cartDef.files.length;f++) {
                        var file = cartDef.files[f];
                        var dirs = file.split('/');                        
                        var destFile = keys[i];
                        var foundCarts = false;
                        for(var e=0;e<dirs.length;e++) {
                            if(dirs[e] === 'cartridge') foundCarts = true;
                            if(foundCarts) destFile += '/' + dirs[e];
                        }
                        if(destFile.length > 0) {
                            try {
                                archive.append(fs.createReadStream(__dirname + "/working/" + cartDef.files[f]), { name: destFile});
                            } catch (e) {}                            
                        }
                    }
                } else {    
                    if(cartDef.path.length > 0) {
                        archive.directory("./working/" + cartDef.path, keys[i]);
                    }
                }
            }
        } else {
            if(cart.path.length > 0) {
                archive.directory("./working/" + cart.path, keys[i]);
            }
        }
    }

    archive.finalize();
}