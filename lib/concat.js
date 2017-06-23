exports.compile = function(catFiles, concatComplete) {
    var conf = require('./config');
    const utils = require('./utils')
    var concat = require('concat-files');
    
    catFiles = catFiles || conf.processors.concat.files;

    var async = require('async');

    var files = Object.keys(catFiles);
    

    async.each(files, (file, callback) => {        
        console.log("Concating", file);
        var inFiles = [];
        for(f in catFiles[file]) {
            inFiles.push(utils.workingDir() + catFiles[file][f])
        }
        
        concat(inFiles, utils.workingDir() +  file, function(err) {
            if(err) console.log(err);
            callback();
        });
    }, () => {
        if(concatComplete) concatComplete();
    });
};