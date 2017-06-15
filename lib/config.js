var conf = require('../config.json');

var nconf = require('nconf');
nconf.file({ file: '../config.json' });
nconf.defaults(
    {
        "defaults": {},
        "connections": {},
        "cartridges": {},
        "repos": {},
        "deployments": {},
        "processors": {}
    });

exports.cartridges = conf.cartridges;
exports.connections = conf.connections;
exports.repos = conf.repos;
exports.deployments = conf.deployments;
exports.processors = conf.processors;
exports.defaults = conf.defaults;

/*

var conf = require('./config')
var carts = conf.cartridges;

carts[0].url = "myurl"

conf.save('cartridges',carts, () => {})



*/


//setting values should be like parent:child:child format
exports.save = function(setting, value, callback) {
    nconf.set(setting, value);
    nconf.save((e)=> { 
        if (e) {
            console.log(e); 
        } else  {
            if(callback) callback();
        }
    });
}

exports.read = function(setting) {
    var x = nconf.get(setting);
    return x;
}

exports.delete = function(setting, callback) {
    var parts = setting.split(':');
    var parent = conf[parts[0]];
    var settingPath = parts[0];

    for(var i=1;i<parts.length-1;i++) {
        settingPath += ":" + parts[i];
        parent = parent[parts[i]];
    }

    if(parent != conf) {
        delete parent[parts[parts.length-1]];
        nconf.set(settingPath, parent);        
        nconf.save((e)=> { 
            if (e) {
                console.log(e); 
            } else  {
                if(callback) callback();
            }
        });
    }
}

