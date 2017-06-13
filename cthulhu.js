const read = require('./read');
const conf = require('./config');

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
            conf.save('defaults:connection', host, () =>{
                console.log("\r\nDefault server configuration set.\r\n")
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
                conf.save('repos', conf.repos, () => {
                    console.log("\nAll repos set to branch '"+ url +"'.\r\n")         
                });
            } else {
                conf.save('repos:' + url +':branch', branch || 'master', () => {
                    console.log("\n" + url + " repo set to branch '"+ branch +"'.\r\n");
                });
            }

        }
        if(options.add && url) {
            configRepo(url)
        }
        if(options.delete && url) {
            conf.delete('repos:' + url, () => {
                console.log(url, "removed.\n");
            });
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
    conf.save('repos:' + repo, '');
    conf.save('repos:' + repo + ':url', url);
    read({prompt:'What is the default branch for ' + repo + '? (master): '}, (e, branch) => {  
        branch = branch || 'master';
        conf.save('repos:' + repo +':branch', branch);
   
        if(url.split(':')[0] === 'https' || url.split(':')[0] === 'http') {
            read({prompt:'Does ' + repo + ' require an user and password? [yes/no]: '}, (e, needspass) => {  
                if(needspass === 'yes') {
                    read({prompt:'Enter the username for ' + repo + ' (~/.ssh/id_rsa.pub): '}, (e, user) => {
                        read({prompt:'Enter the password for ' + user + ': ', silent:true}, (e, pass) => {
                            conf.save('repos:' + repo +':username', user);
                            conf.save('repos:' + repo +':password', pass.length > 0 ? utils.encrypt(pass,user) : '', () => {
                                console.log("\r\Repo configuration complete.\r\n")
                            });                            
                        });
                    });
                } else {
                    console.log("\r\Repo configuration complete.\r\n")           
                }
            });
        } else {
            read({prompt:'Does ' + repo + ' require an ssh key? [yes/no]: '}, (e, needskey) => {  
                if(needskey === 'yes') {
                    read({prompt:'Enter the private ssh key location used for ' + repo + ' (~/.ssh/id_rsa): '}, (e, privkey) => {
                        read({prompt:'Enter the public ssh key location used for ' + repo + ' (~/.ssh/id_rsa.pub): '}, (e, pubkey) => {
                            read({prompt:'Enter the password for the ssh key: ', silent:true}, (e, pass) => {
                                conf.save('repos:' + repo +':ssh:privatekey', privkey || '~/.ssh/id_rsa');
                                conf.save('repos:' + repo +':ssh:publickey', pubkey || '~/.ssh/id_rsa.pub');
                                conf.save('repos:' + repo +':ssh:password', pass.length > 0 ? utils.encrypt(pass,repo) : '', () => {
                                    console.log("\r\Repo configuration complete.\r\n")
                                });
                            });
                        });
                    });
                } else {
                    console.log("\r\Repo configuration complete.\r\n")
                }

            });
        }
    });
}

function buildZip() {
    var zip = require('./zip');
    zip.zipDirectories(null, (file) => {
        console.log('Build archive generated at', file)
    });
}

function configServer(host) {
    conf.save('connections:' + host, '')

    read({prompt:'Enter the username for ' + host + ': '}, (e, user) => {
        conf.save('connections:' + host +':username', user);
        
        read({prompt:'Enter the password for ' + user + ': ', silent:true}, (e, pass) => {
            var utils = require('./utils.js');
            conf.save('connections:' + host +':password', utils.encrypt(pass,user));

            read({prompt:'Does ' + host + ' require a certificate to upload files? [yes/no]: '}, (e, needscert) => {                        
                if(needscert === "yes") {
                    read({prompt:'Enter the SFCC private certificate for ' + host + ': '}, (e, privatecert) => {
                        conf.save('connections:' + host +':servercert', privatecert);
                        
                        read({prompt:'Enter the path for the private PEM file: '}, (e, pemfile) => {
                            read({prompt:'Enter the path for the private KEY file: '}, (e, keyfile) => {
                                read({prompt:'Enter the passphrase for the private key: ', silent:true}, (e, pass) => {
                                    conf.save('connections:' + host +':privatekey:certpath', pemfile);
                                    conf.save('connections:' + host +':privatekey:keypath', keyfile);
                                    conf.save('connections:' + host +':privatekey:password', utils.encrypt(pass,user), () => {
                                        console.log("\r\nServer configuration complete.\r\n")
                                    });
                                });
                            });
                        });                              
                    });
                } else {
                    var x = conf.delete('connections:' + host + ":privatekey");
                    console.log("\r\nServer configuration complete.\r\n")
                }
                
            });
        });                
    });
}