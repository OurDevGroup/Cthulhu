exports.clone = function(callback) {
    var nodegit = require('nodegit');
    var conf = require('./config.json');

    var checkout = function(repo, callback) {
        repo.checkoutBranch('build');
        if(callback) callback();
    }

    function clonerepo(reponame,callback) {

        var cloneOpts = {
            fetchOpts: {
                callbacks: {
                    credentials: function(url, userName) {            
                        return nodegit.Cred.sshKeyNew(
                        userName,
                        conf.repos[reponame].ssh.publickey,
                        conf.repos[reponame].ssh.privatekey,
                        conf.repos[reponame].ssh.password
                        );
                    }
                }
            }
        };


        console.log("Pulling " + reponame + " repo...");
        nodegit.Repository.open('./working/' + reponame).then((repo) => {            
            checkout(repo, callback);
        }).catch(function(err) {
            nodegit.Clone(conf.repos[reponame].url, './working/' + reponame, cloneOpts).then((repo) => {
                checkout(repo, callback);            
            }).catch(function (err) {
                console.log("error",err);
            });        
        });
    }
    
    var async = require("async");

    async.each(Object.keys(conf.repos), 
        function(repo, callback) {
            clonerepo(repo, callback);
        }, 
        function(err) {
            if(err)console.log("error",err);
            if(callback) callback();
        }
    );


}