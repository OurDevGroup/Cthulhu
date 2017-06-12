const read = require('./read');

const conf = require('./config.json');

var nconf = require('nconf');
nconf.file({ file: './config.json' });
nconf.defaults(
    {
        "defaults": {},
        "connections": {},
        "cartridges": {},
        "repos": {},
        "deployments": {},
        "processors": {}
    });

const prog = require('commander');
prog.version('0.0.1');

prog.command('server [host]')
    .description("Configure SFCC server connections")
    .option('-l, --list','list all defined SFCC connections')
    .option('-a, --add', "define a new SFCC server connection")
    .option('-u, --update', "update an existing SFCC server connection")
    .option('-d, --delete', "delete and existing SFCC server connection")
    .option('-s, --set', "sets a SFCC server to be the default connection")
    .action(function(host, options) {
        if(options.add && host) {
            configServer(host);
        } 
        if(options.list) {
            for(var key in conf.connections) {
                console.log(key)            
            }
            console.log("\n")
        }
        if(options.set && host) {
            nconf.set('defaults:connection', host);
            
            nconf.save((e)=> { 
                if(!e) {
                    console.log("\r\nDefault server configuration set.\r\n")
                } 
            });            
        }
    });

prog.command('repo [url] [branch]')
    .description("Configure GIT repository URLs")
    .option('-a, --add','configure a new GIT repository')
    .option('-l, --list','list all defined GIT repositories')
    .option('-d, --delete','remove GIT repository')
    .option('-c, --clean','nuke the working directory')
    .option('-f, --fetch','fetch latest code from remote server')
    .option('-b, --branch','switch branch for a given repo')
    .action(function(url, branch, options) {
        if(options.clean) {
            var util = require('./utils')
            util.clean();
            console.log("Working folder was nuked!\n");
        }
        if(options.fetch) {
            //var branch = url || 'master'
            var git = require('./git')
            console.log("Pulling code from remote servers...");
            git.clone(url, () => {
                console.log("Code pull is complete.\n");
            });
        }
        if(options.branch && url) {
            if(!branch) {                
                for(var key in conf.repos) {
                    conf.repos[key]["branch"] = url;                    
                }
                nconf.set('repos', conf.repos);       
                nconf.save((e)=> { if(e)console.log(e); })
                console.log("\nAll repos set to branch '"+ url +"'.\r\n")         
            } else {
                nconf.set('repos:' + url +':branch', branch || 'master');
                nconf.save((e)=> { if(e)console.log(e); })
                console.log("\n" + url + " repo set to branch '"+ branch +"'.\r\n")                  
            }

        }
        if(options.add && url) {
            configRepo(url)
        }
        if(options.delete && url) {
            var x = nconf.get('repos');
            delete x[url];        
            nconf.set('repos',x );        
            nconf.save((e)=> { if(e)console.log(e); });
            console.log(url, "removed.\n");
        }
        if(options.list) {
            for(var key in conf.repos) {
                console.log(key)            
            }
            console.log("\n")            
        }
    });
    
prog.command('zip')
    .option('-b --build', 'build zip for current deployment')
    .action(function(options) {
        if(options.build) {
            buildZip();
        }
    });

console.log ('\n\n^(;,;)^ Cthulu Build Script\n        for Salesforce Commerce Cloud\n        powered by Benny P\n');

prog.parse(process.argv);

function configRepo(url) {
    repo = url.substring(url.lastIndexOf('/')+1).split('.')[0];
    console.log('Configuring', repo, '...');
    nconf.set('repos:' + repo, '');
    nconf.set('repos:' + repo + ':url', url);
    if(url.split(':')[0] === 'https' || url.split(':')[0] === 'http') {
        read({prompt:'Does ' + repo + ' require an user and password? [yes/no]: '}, (e, needspass) => {  
            if(needspass === 'yes') {
                read({prompt:'Enter the username for ' + repo + ' (~/.ssh/id_rsa.pub): '}, (e, user) => {
                    read({prompt:'Enter the password for ' + user + ': ', silent:true}, (e, pass) => {
                        nconf.set('repos:' + repo +':username', user);
                        nconf.set('repos:' + repo +':password', pass.length > 0 ? utils.encrypt(pass,user) : '');
                        nconf.save((e)=> { if(e)console.log(e); })
                        console.log("\r\Repo configuration complete.\r\n")
                    });
                });
            } else {
                console.log("\r\Repo configuration complete.\r\n")
                nconf.save((e)=> { if(e)console.log(e); })               
            }
        });
    } else {
        read({prompt:'Does ' + repo + ' require an ssh key? [yes/no]: '}, (e, needskey) => {  
            if(needskey === 'yes') {
                read({prompt:'Enter the private ssh key location used for ' + repo + ' (~/.ssh/id_rsa): '}, (e, privkey) => {
                    read({prompt:'Enter the public ssh key location used for ' + repo + ' (~/.ssh/id_rsa.pub): '}, (e, pubkey) => {
                        read({prompt:'Enter the password for the ssh key: ', silent:true}, (e, pass) => {
                            nconf.set('repos:' + repo +':ssh:privatekey', privkey || '~/.ssh/id_rsa');
                            nconf.set('repos:' + repo +':ssh:publickey', pubkey || '~/.ssh/id_rsa');
                            nconf.set('repos:' + repo +':ssh:password', pass.length > 0 ? utils.encrypt(pass,repo) : '');
                            nconf.save((e)=> { if(e)console.log(e); })
                            console.log("\r\Repo configuration complete.\r\n")
                        });
                    });
                });
            } else {
                console.log("\r\Repo configuration complete.\r\n")
                nconf.save((e)=> { if(e)console.log(e); })
            }

        });

        
    }
}

function buildZip() {
    var zip = require('./zip');
    zip.zipDirectories(null, (file) => {
        console.log('Build archive generated at', file)
    });
}

function configServer(host) {
    nconf.set('connections:' + host, '')

    read({prompt:'Enter the username for ' + host + ': '}, (e, user) => {
        nconf.set('connections:' + host +':username', user);
        
        read({prompt:'Enter the password for ' + user + ': ', silent:true}, (e, pass) => {
            var utils = require('./utils.js');
            nconf.set('connections:' + host +':password', utils.encrypt(pass,user));

            read({prompt:'Does ' + host + ' require a certificate to upload files? [yes/no]: '}, (e, needscert) => {                        
                if(needscert === "yes") {
                    read({prompt:'Enter the SFCC private certificate for ' + host + ': '}, (e, privatecert) => {
                        nconf.set('connections:' + host +':servercert', privatecert);
                        
                        read({prompt:'Enter the path for the private PEM file: '}, (e, pemfile) => {
                            read({prompt:'Enter the path for the private KEY file: '}, (e, keyfile) => {
                                read({prompt:'Enter the passphrase for the private key: ', silent:true}, (e, pass) => {
                                    nconf.set('connections:' + host +':privatekey:certpath', pemfile);
                                    nconf.set('connections:' + host +':privatekey:keypath', keyfile);
                                    nconf.set('connections:' + host +':privatekey:password', utils.encrypt(pass,user));

                                    
                                    nconf.save((e)=> { 
                                        if(!e) {
                                            console.log("\r\nServer configuration complete.\r\n")
                                        }  
                                    });
                                });
                            });
                        });                              
                    });
                } else {
                    var x = nconf.get('connections:' + host );
                    delete x.privatekey;  
                    nconf.set('connections:' + host, x);
                    console.log("\r\nServer configuration complete.\r\n")
                    nconf.save((e)=> { if(e)console.log(e); })
                }
                
            });
        });                
    });
}