exports.minify = function(minFiles, minPaths, minifyComplete) {
    var conf = require('./config');
    const utils = require('./utils')
    
    minFiles = minFiles || conf.processors.minify.files;
    minPaths = minPaths || conf.processors.minify.paths;

    var compressor = require('node-minify');

    var filesToMin = []

    for(var f in minFiles) {
        var outfile = utils.workingDir() + minFiles[f];
        var infile = utils.workingDir() + f;
        filesToMin.push({in:infile, out:outfile});
    }

    for(var p in minPaths) {
        var path = minPaths[p];          
        var files = utils.getAllFiles(utils.workingDir() + path);
        for(var f in files) {
            var file = files[f];
            filesToMin.push({in:file,out:file});
        }
    }

    var async = require('async')
    async.each(filesToMin, (file, callback) => {
        this.minifyFile(file.in, file.out, () => {
            console.log("min done")
            callback();
        })
    }, (err) => {       
        console.log("realy done") 
        minifyComplete();
    });


};


exports.minifyFile = function(infile, outfile, finished) {
    console.log("Minifying", infile)
    var compressor = require('node-minify')
    if(infile.toLowerCase().endsWith("js")) {
        compressor.minify({
            compressor: 'uglifyjs',
            input: infile,
            output: outfile,
            callback: function (err, min) {
                if(err) console.log(err)
                finished();
            }
        });
    } else 
    if(infile.toLowerCase().endsWith("css")) {
        compressor.minify({
            compressor: 'clean-css',
            input: infile,
            output: outfile,
            callback: function (err, min) {
                if(err) console.log(err);
                finished();              
            }
        });
    } else {
        finished();
    }
}

