var nodegit = require('nodegit');
var conf = require('./config');
const utils = require('./utils');

exports.clone = function(cloneComplete) {

    var checkout = function(repo, branch, cloneOptions, callback) {
        branch = branch || 'master';

        repo.fetch("origin", cloneOptions.fetchOpts).then(() => {
            repo.getBranch('refs/remotes/origin/' + branch).then(function(reference) {
                return repo.checkoutRef(reference);
            }).catch(function(err) {
                console.log(err)
            }).then(()=> {
                if(cloneComplete) cloneComplete();
            });
        }).catch(function(err) {
            console.log(err)
        });
        
    }

    function clonerepo(reponame, finished) {
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
        nodegit.Repository.open(utils.workingDir() + reponame).then((repo) => {
            checkout(repo, conf.repos[reponame].branch, cloneOpts, () => {
                console.log(reponame,"complete.")
                finished();
            });
        }).catch(function(err) {
            nodegit.Clone(conf.repos[reponame].url, utils.workingDir() + reponame, cloneOpts).then((repo) => {
                checkout(repo, conf.repos[reponame].branch, cloneOpts, () => {
                    console.log(reponame,"complete.")
                    finished();
                });            
            }).catch(function (err) {
                if(err) console.log("error",err);
            });        
        });
    }
    
    var async = require("async");

    async.each(Object.keys(conf.repos), 
        function(repo, callback) {
            clonerepo(repo, () => {
                console.log("finished")
                callback();
            });
        }, 
        function(err) {            
            if(err)console.log("error",err);
            if(cloneComplete) cloneComplete();
        }
    );
} //end clone

exports.checkoutByTag = function(tag, callback) {
    
    var reponame = conf.repos[0];
    var getTag = function(repo, callback) {
        Tag.list(repo).then(function(array) {
        // array is ['v1.0.0','v2.0.0']
            return Tag.lookup(repo,array[0]);
        })
    }


    nodegit.Repository.open(utils.workingDir() + reponame).then((repo) => {
            Tag.list(repo).then(function(array) {
                console.log(array);
            });
    });
}