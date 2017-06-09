var conf = require("./config.json");

exports.zipDirectories = function() {
    var fs = require('fs');
    var archiver = require('archiver');
    
    var output = fs.createWriteStream(__dirname + '/build_123.zip');
    var archive = archiver('zip', {
        store: true
    });

    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('Build Zip File Created!');
    });
    
    archive.on('error', function(err) {
        throw err;
    });
 
    archive.pipe(output);

    var keys = Object.keys(conf.cartridges);
    for (var i = 0,length = keys.length; i < length; i++) {
        archive.directory("working/" + conf.cartridges[keys[i]].path, keys[i]);
        console.log("Cartridge: " + keys[i] + " Has been added to the build!")
    }

    archive.finalize();
}