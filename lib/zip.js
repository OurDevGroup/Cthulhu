exports.compress = function(cartridges, zipname, compressComplete) {
    var utils = require('./utils');
    var conf = require("./config");

    cartridges = cartridges || conf.cartridges;
    
    var dir = utils.buildDir();
    
    zipname = zipname || utils.buildNumber();

    var fs = require('fs');
    var archiver = require('archiver');

    var outfile = dir + zipname + '.zip';

    var output = fs.createWriteStream(outfile);
    
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function() {
        if(compressComplete) compressComplete(outfile);
    });
    
    archive.on('error', function(err) {
        throw err;
    });
 
    archive.pipe(output);

    var keys = Object.keys(cartridges);
    for (var i = 0,length = keys.length; i < length; i++) {
        var cart = cartridges[keys[i]];
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
                                archive.append(fs.createReadStream(utils.workingDir() + cartDef.files[f]), { name: destFile});
                            } catch (e) {}                            
                        }
                    }
                } else {    
                    if(cartDef.path.length > 0) {
                        archive.directory(utils.workingDir() + cartDef.path, keys[i]);
                    }
                }
            }
        } else {
            if(cart.path.length > 0) {
                archive.directory(utils.workingDir() + cart.path, keys[i]);
            }
        }
    }

    archive.finalize();
}