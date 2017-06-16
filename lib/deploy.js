var conf = require('./config');

exports.deploy = function(server, callback) {
    server = server || conf.defaults.connection;

    var zip = require('./zip');
    var git = require('./git')
    var sass = require('./sass')
    var minify = require('./minify')
    var dw = require('./dwdav')
    
    git.clone(() => {
        console.log("compile sass")
        sass.compile(null, null, () => {
            console.log("minify")
            minify.minify(null, null, () => {
                console.log("zip")
                zip.compress(null, null, (file) => {
                    console.log("upload")
                    dw.deploy(server, file, () => {
                        if(callback) callback();
                    });
                });
            });
        });
    });
    
    
}