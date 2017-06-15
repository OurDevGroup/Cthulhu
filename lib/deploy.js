var conf = require('./config');

exports.deploy = function(name) {
    var deploy = conf.deployments[name];
    var zip = require('./zip');

    
    
}

exports.createDeployment = function(name, cartridges, processors) {
    conf.save("deployments:" + name + ":cartridges", cartridges);
    conf.save("deployments:" + name + ":processors", processors);
}