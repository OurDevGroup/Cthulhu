exports.compile = function(sassFiles, sassPaths, sassComplete) {
    var conf = require('./config');
    const utils = require('./utils')

    sassFiles = sassFiles || conf.processors.sass.files;
    sassPaths = sassPaths || conf.processors.sass.paths;

    var sass = require('node-sass');
    var async = require('async');


    var files = Object.keys(sassFiles);

    async.each(files, (file, callback) => {
        console.log("Sassing", utils.workingDir() + sassFiles[file])
        sass.render({
            file: utils.workingDir() + sassFiles[file]
        }, function(err, result) { 
            if(err) console.log(err.message);
            var fs = require('fs');

            var out = utils.workingDir() + file;

            utils.ensureDirectoryExistence(out)
            
            if(!result && err) {
                console.log("Shit broken", out)
                console.log(err)
            } else {
                fs.writeFile(out, result.css)
            }

            callback();//async done
        });
    }, () => {
        if(sassComplete) sassComplete();
    });
};