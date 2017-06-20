const read = require('./lib/read');
const conf = require('./lib/config');

const prog = require('commander');
prog.version('0.1.3');

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
            var util = require('./lib/utils')
            util.clean();
            console.log("Working folder was nuked!\n");
        }
        if(options.fetch) {
            //var branch = url || 'master'
            var git = require('./lib/git')
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


prog.command('sass [infile] [outfile]')
    .option('-l, --list', 'list all file and path definitions for the Sass processor')
    .option('-a, --add', 'add file or path defintion')
    .option('-d, --delete', 'delete a file or path defintion')
    .option('-c, --compile', 'compile scss files into css')
    .action(function(infile, outfile, options) {
        if(!conf.processors.sass) {
            conf.save("processors:sass:files", []);
            conf.save("processors:sass:paths", []);
        }

        if(options.compile) {
            var sass = require('./lib/sass')
            sass.compile(null, null, () => {

            });
        }

        if(options.list) {
            if(conf.processors.sass.files) {
                for(var f in conf.processors.sass.files) {
                    console.log(conf.processors.sass.files[f], "->", f)
                }
            } else {
                console.log("No file definitions found.");
            }
            if(conf.processors.sass.paths) {
                for(var p in conf.processors.sass.paths) {
                    console.log(conf.processors.sass.paths[p])
                }
            } else {
                console.log("No path definitions found.");
            }            
            console.log("\n")    
        }

        if(options.delete && infile) {
            var files = Object.keys(conf.processors.sass.files);
            for(f in files) {
                if(files[f].indexOf(infile) > 0) {
                    var delFile = files[f];
                    conf.delete("processors:sass:files:" + delFile, () => {
                        console.log(delFile, "was removed from Sass definitions.\n");        
                    });
                }             
            }

            var paths = conf.processors.sass.paths;
            for(var f in paths); {
                if(paths[f] == infile) {
                    paths = paths.splice(f+1,1);
                    conf.save("processors:sass:paths", paths, () => {
                        console.log(infile, "was removed from Sass definitions.\n");
                    });
                    return;
                }             
            }
        }

        if(options.add) {
            if(infile && outfile) {
                //var files = conf.processors.sass.files;
                //files.push({target:infile, output:outfile});
                conf.save("processors:sass:files:" + outfile, inffile);
            } else if(infile) {
                var paths = conf.processors.sass.paths;
                paths.push(infile);
                conf.save("processors:sass:paths", paths);
            }
            console.log(infile,"was added to the Sass defingitions.\n")
        }
    });

prog.command('minify [infile] [outfile]')
    .option('-l, --list', 'list all file and path definitions for the minify processor')
    .option('-a, --add', 'add file or path defintion')
    .option('-d, --delete', 'delete a file or path defintion')
    .action(function(infile, outfile, options) {
        if(!conf.processors.minify) {
            conf.save("processors:minify:files", []);
            conf.save("processors:minify:paths", []);
        }

        if(options.list) {
            if(conf.processors.minify.files) {
                for(var f in conf.processors.minify.files) {
                    console.log(conf.processors.minify.files[f], "->", f)
                }
            } else {
                console.log("No file definitions found.");
            }
            if(conf.processors.minify.paths) {
                for(var p in conf.processors.minify.paths) {
                    console.log(conf.processors.minify.paths[p])
                }
            } else {
                console.log("No path definitions found.");
            }            
            console.log("\n")    
        }

        if(options.delete && infile) {
            var files = Object.keys(conf.processors.minify.files);
            for(f in files) {
                if(files[f].indexOf(infile) > 0) {
                    var delFile = files[f];
                    conf.delete("processors:minify:files:" + delFile, () => {
                        console.log(delFile, "was removed from minify definitions.\n");        
                    });
                }             
            }

            var paths = conf.processors.minify.paths;
            for(var f in paths); {
                if(paths[f] == infile) {
                    paths = paths.splice(f+1,1);
                    conf.save("processors:minify:paths", paths, () => {
                        console.log(infile, "was removed from minify definitions.\n");
                    });
                    return;
                }             
            }
        }

        if(options.add) {
            if(infile && outfile) {
                conf.save("processors:minify:files:" + outfile, inffile);
            } else if(infile) {
                var paths = conf.processors.minify.paths;
                paths.push(infile);
                conf.save("processors:minify:paths", paths);
            }
            console.log(infile,"was added to the minify defingitions.\n")
        }
    });


prog.command('cartridge [name]')
    .option('-a, --add', 'define new cartridge')
    .option('-l, --list', 'list all cartridge definitions')
    .option('-d, --delete', 'delete a cartridge definition')
    .action(function(name, options) {
        if(name && options.delete) {
            conf.delete('cartridges:' + name, () => {
                console.log(name, "removed.");
            });
        }

        if(options.list) {
            for(var key in conf.cartridges) {
                console.log(key)            
            }
            console.log("\n")
        }        

        if(name && options.add) {
            var repos = Object.keys(conf.repos);
            
            read({prompt:'What is the repo contains ' + name + '?' + (repos.length > 0 ? ' (' + repos[0] + ')' : '') +': '}, (e, repo) => {  
                repo = repo || (repos.length > 0 ? repos[0] : null);
                
                var util = require('./lib/utils');

                util.findDirectory('./working/' + repo, name, (path) => {
                    path = path.replace('./working', '');
                    read({prompt:'Where is the ' + name + ' located in the working directory?' + (path.length > 0 ? ' (' + path + ')' : '') +': '}, (e, cartpath) => {  
                        cartpath = cartpath || path
                        conf.save('cartridges:' + name + ':path', cartpath, () => {
                            console.log(name,"added.");
                        });
                    });
                });

            });
        }
    });

prog.command('deploy [name]')
    .action(function(name, options) {
        if(name && conf.connections[name]) {
            console.log("Deploying to", name);
            var deploy = require('./lib/deploy')
            deploy.deploy(name, () => {
                console.log("Deployment complete.")
            });
        } else {
            console.log("Invalid deployment server.");
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
    var zip = require('./lib/zip');
    zip.compress(null, null, (file) => {
        console.log('Build archive generated at', file)
    });
}

function configServer(host) {
    conf.save('connections:' + host + ':host', host)

    read({prompt:'Enter the username for ' + host + ': '}, (e, user) => {
        conf.save('connections:' + host +':username', user);
        
        read({prompt:'Enter the password for ' + user + ': ', silent:true}, (e, pass) => {
            var utils = require('./lib/utils.js');
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
                    var x = conf.delete('connections:' + host + ':privatekey');
                    console.log("\r\nServer configuration complete.\r\n")
                }
                
            });
        });                
    });
}

function defineDeploy(name) {
    
}