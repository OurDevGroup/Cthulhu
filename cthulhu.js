const read = require('./read');

var nconf = require('nconf');
nconf.file({ file: './config.json' });
nconf.defaults(
    {
        "connections": {
        },
        "cartridges": {
        },
        "repos": {
        }
    });

const prog = require('commander');
prog.version('0.0.1');

prog.command('server [host]')
    .description("Configure SFCC server connections.")
    .option('-a, --add', "define a new SFCC server connection")
    .option('-u, --update', "update an existing SFCC server connection")
    .option('-d, --delete', "delete and existing SFCC server connection")
    .option('-s, --set', "sets a SFCC server to be the default connection")
    .action(function(host, options) {
        if(options.add && host) {
            configServer(host);
        } 
    });
    

console.log ('\r\n\r\n^(;,;)^ Cthulu Build Script\r\n        for Salesforce Commerce Cloud\r\n');


prog.parse(process.argv);


function hidden(query, callback) {
    var stdin = process.openStdin();
    process.stdin.on("data", function(char) {
        char = char + "";
        switch (char) {
            case "\n":
            case "\r":
            case "\u0004":
                stdin.pause();
                break;
            default:
                process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length+1).join("*"));
                break;
        }
    });

    rl.question(query, (value) => {
        rl.history = rl.history.slice(1);    np 
        callback(value);
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

                                    console.log("\r\nServer configuration complete.\r\n")
                                    nconf.save((e)=> { if(e)console.log(e); })  ;
                                });
                            });
                        });                              
                    });
                } else {
                    nconf.remove('connections:' + host + ':privatekey');
                    console.log("\r\nServer configuration complete.\r\n")
                    nconf.save((e)=> { if(e)console.log(e); })
                }
                
            });
        });                
    });
}