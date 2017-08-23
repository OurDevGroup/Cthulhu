const read = require('./lib/read');
const conf = require('./lib/config');
const utils = require('./lib/utils')

const prog = require('commander');
prog.version('0.1.3');

prog.command('server [alias]')
    .description("Configure SFCC server connections")
    .option('-l, --list','list all defined SFCC connections')
    .option('-a, --add', "define a new SFCC server connection")
    .option('-u, --update', "update an existing SFCC server connection")
    .option('-d, --delete', "delete and existing SFCC server connection")
    .option('-s, --set', "sets a SFCC server to be the default connection")
    .action(function(host, options) {
        if((options.add || options.update) && host) {
            configServer(host, options.update);
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
    .option('-d, --default','set GIT repository as the default')
    .option('-r, --remove','remove GIT repository')
    .option('-c, --clean','nuke the working directory')
    .option('-f, --fetch','fetch latest code from remote server')
    .option('-b, --branch','switch branch for a given repo')
    .action(function(url, branch, options) {
        if(options.clean) {            
            utils.clean();
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
        if(options.default && url) {
            conf.save('defaults:repo', url, () =>{
                console.log("\r\nDefault repo configuration set.\r\n")
            });                       
        }
        if(options.remove && url) {
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


prog.command('concat')
    .option('-l, --list', 'list all file and path definitions for the minify processor')
    .option('-g, --glue', 'glue the files together')
    .action(function(options) {
        if(options.list) {
            if(conf.processors.concat.files) {
                for(var f in conf.processors.concat.files) {                    
                    console.log(conf.processors.concat.files[f], "->", f)
                }
            } else {
                console.log("No file definitions found.");
            }          
            console.log("\n")    
        }

        if(options.glue) {
            var concat = require('./lib/concat');
            concat.compile(null, () => {
                console.log("Done.")
            });
        }
    });


prog.command('minify [infile] [outfile]')
    .option('-l, --list', 'list all file and path definitions for the minify processor')
    .option('-a, --add', 'add file or path defintion')
    .option('-s, --shrink', 'perform the minification on the defined files')
    .option('-d, --delete', 'delete a file or path defintion')
    .action(function(infile, outfile, options) {
        if(!conf.processors.minify) {
            conf.save("processors:minify:files", []);
            conf.save("processors:minify:paths", []);
        }

        if(options.shrink) {
            var min = require('./lib/minify')
             min.minify(null, null, () => { 
                 console.log("Minification is done.")
             });
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
    .option('-c, --config', 'perform automatic configuration, you lazy bastard')
    .option('-d, --delete', 'delete a cartridge definition')
    .action(function(name, options) {
        if(name && options.delete) {
            conf.delete('cartridges:' + name, () => {
                console.log(name, "removed.");
            });
        }

        if(options.config && name) {
            if(conf.cartridges) {
                for(cart in conf.cartridges) {
                    if(conf.cartridges[cart].files == null && conf.cartridges[cart].path == null) {
                            conf.save('cartridges:' + cart + ':path', name + cart)
                    }
                }
            }
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

                utils.findDirectory('./working' + repo, name, (path) => {
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

function configServer(alias, update) {    
    conf.connections[alias] = conf.connections ? (conf.connections[alias] || {}) : {};

    read({prompt:'Enter the host name for ' + alias + (update ? ' (' + conf.connections[alias].host + ')': '') + ': '}, (e, host) => {        
        if(update && (!host || host.length == 0)) 
            host = conf.connections[alias].host;

        conf.save('connections:' + alias + ':host', host)

        var oldUser = update ? conf.connections[alias].username : null;

        read({prompt:'Enter the username for ' + host + (update ? ' (' + conf.connections[alias].username + ')': '') + ': '}, (e, user) => {            
            var oldPass = null;

            if(update && (!user || user.length == 0)) {
                if(conf.connections[alias].password && oldUser)
                    oldPass = utils.decrypt(conf.connections[alias].password, oldUser); //oldpass
                user = conf.connections[alias].username;
            }

            conf.save('connections:' + alias +':username', user);
            
            read({prompt:'Enter the password for ' + user + (update && oldPass ? ' (saved password)': '') + ': ', silent:true}, (e, pass) => {
                if(update && (!pass || pass.length == 0)) 
                    pass = oldPass

                
                conf.save('connections:' + alias +':password', utils.encrypt(pass,user));




                read({prompt:'Does ' + host + ' require a certificate to upload files? [yes/no] ' + (update  && conf.connections[alias].servercert ? ' (yes)': '(no)') + ': '}, (e, needscert) => {   
                    if(update && (!needscert || needscert.length == 0)) 
                        needscert = conf.connections[alias].servercert ? 'yes' : 'no';                    

                    if(needscert === "yes") {
                        read({prompt:'Enter the SFCC private certificate PEM for ' + host + (update ? ' (' + conf.connections[alias].servercert + ')': '') + ': '}, (e, privatecert) => {
                            if(update && (!privatecert || privatecert.length == 0)) 
                                privatecert = conf.connections[alias].servercert;

                            conf.save('connections:' + alias +':servercert', privatecert);
                            
                            read({prompt:'Enter the path for the private PEM file' + (update && conf.connections[alias].privatekey && conf.connections[alias].privatekey.certpath ? ' (' + conf.connections[alias].privatekey.certpath + ')': '') + ': '}, (e, pemfile) => {
                                read({prompt:'Enter the path for the private KEY file' + (update &&  conf.connections[alias].privatekey && conf.connections[alias].privatekey.keypath ? ' (' + conf.connections[alias].privatekey.keypath + ')': '') + ': '}, (e, keyfile) => {

                                    oldPass = null;
                                    if(conf.connections[alias].privatekey && conf.connections[alias].privatekey.password && oldUser)
                                        oldPass = utils.decrypt(conf.connections[alias].privatekey.password, oldUser); //oldpass


                                    read({prompt:'Enter the passphrase for the private key' + (update && oldPass ? ' (saved password)': '') + ': ', silent:true}, (e, pass) => {


                                        if(update && (!pemfile || pemfile.length == 0)) 
                                            pemfile = conf.connections[alias].privatekey.certpath;

                                        if(update && (!keyfile || keyfile.length == 0)) 
                                            keyfile = conf.connections[alias].privatekey.keypath;                                            

                                        if(update && (!pass || pass.length == 0)) 
                                            pass = oldPass;


                                        conf.save('connections:' + alias +':privatekey:certpath', pemfile);
                                        conf.save('connections:' + alias +':privatekey:keypath', keyfile);
                                        conf.save('connections:' + alias +':privatekey:password', utils.encrypt(pass,user), () => {
                                            console.log("\r\nServer configuration complete.\r\n")
                                        });
                                    });
                                });
                            });                              
                        });
                    } else {
                        var x = conf.delete('connections:' + alias + ':privatekey');
                        console.log("\r\nServer configuration complete.\r\n")
                    }
                    
                });
            });                
        });
    });
}

function defineDeploy(name) {
    
}
