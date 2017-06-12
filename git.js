var nodegit = require('nodegit');
var conf = require('./config.json');

exports.clone = function(branch, callback) {

    var checkout = function(repo, branch, callback) {
        branch = branch || 'master';

        if(typeof branch == "string") {
            repo.checkoutBranch(branch);
            repo.mergeBranches(branch, "origin/"+branch);
        }

        if(callback) callback();
    }

    function clonerepo(reponame,callback) {
        var path = require('flavored-path');

        var cloneOpts = {
            fetchOpts: {
                callbacks: {
                    credentials: function(url, userName) {      
                        return nodegit.Cred.sshKeyNew(
                        userName,
                        path.get(conf.repos[reponame].ssh.publickey),
                        path.get(conf.repos[reponame].ssh.privatekey),
                        conf.repos[reponame].ssh.password
                        );
                    }
                }
            }
        };


        console.log("Pulling " + reponame + " repo...");
        nodegit.Repository.open('./working/' + reponame).then((repo) => {
            checkout(repo, conf.repos[reponame].branch, callback);
        }).catch(function(err) {
            nodegit.Clone(conf.repos[reponame].url, './working/' + reponame, cloneOpts).then((repo) => {
                checkout(repo, conf.repos[reponame].branch, callback);            
            }).catch(function (err) {
                if(err) console.log("error",err);
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

exports.checkoutByTag = function(tag, callback) {
    var reponame = conf.repos[0];
    var getTag = function(repo, callback) {
        Tag.list(repo).then(function(array) {
        // array is ['v1.0.0','v2.0.0']
            return Tag.lookup(repo,array[0]);
        })
    }

    nodegit.Repository.open('./working/' + reponame).then((repo) => {
            Tag.list(repo).then(function(array) {
                console.log(array);
            });
    });
}