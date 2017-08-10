var conf = require('./config');

exports.deploy = function(server, callback) {
    server = server || conf.defaults.connection;

    var zip = require('./zip');
    var git = require('./git')
    var sass = require('./sass')
    var minify = require('./minify')
    var dw = require('./dwdav')
    var utils = require('./utils')
    var concat = require('./concat')
    
    utils.clean(() => {
        git.clone(() => {
            console.log("done pulling")
            console.log("compile sass")
            sass.compile(null, null, () => {
                console.log("minify")
                minify.minify(null, null, () => {
                    console.log("concat")
                    concat.compile(null, () => {
                        console.log("zip")
                        zip.compress(null, null, (file) => {
                            console.log("upload")
                            dw.deploy(server, file, () => {
                                if(callback) callback();
                            });
                        });
                    })
                });
            });
        });
    });
}