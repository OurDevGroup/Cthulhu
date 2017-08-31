var nodegit = require('nodegit');
var open = nodegit.Repository.open;
var Tag = nodegit.Tag;
var Checkout = nodegit.Checkout;
var Reference = nodegit.Reference;
var Promise = require('promise');
var conf = require('./config');
const utils = require('./utils');

exports.clone = function(cloneComplete) {

    var checkout = function(repo, branch, cloneOptions, callback) {
        var isTag = false;

        if(branch.startsWith("tag:")) {
            isTag = true;
            var tag = branch.substring(4);
            var id = "refs/tags/" + tag;
            var ref = null;
            Reference.lookup(repo, id).then(function(reference) {
                if(reference !== undefined)
                    ref = reference;
                else {
                    isTag = false;
                    branch = 'build';
                }
            });
        }

        branch = branch || 'master';

        repo.fetch("origin", cloneOptions.fetchOpts).then(() => {
            if(isTag) {
                console.log('\n');
                console.log("Using Tag: " + tag);
                repo.checkoutRef(ref);
                displayCommitHistory(repo, function() {
                    callback();
                });
            } else {
                repo.getBranch('refs/remotes/origin/' + branch).then(function(reference) {
                    console.log('\n');
                    console.log("Using Branch: " + branch);
                    return repo.checkoutRef(reference);
                }).catch(function(err) {
                    if(err.errno !== -3)
                        console.log(err)
                }).then(()=> {
                    displayCommitHistory(repo, function() {
                        callback();
                    });
                });
            }
        }).catch(function(err) {
            console.log(err)
        });
        
    }

    var checkoutByTag = function(repo, tag, complete) {
        Tag.list(repo).then(function(array) {
            for(var i = 0; i < array.length; i++) {
                if(array[i] == tag) {
                    complete(tag);
                } 
            }
            complete(null);
        })
        .catch(function(error) {
            console.log(error);
            complete(null);
        });
    }
 
    var displayCommitHistory = function(repo, done) {
        repo.getCurrentBranch().then(function(ref) {
            console.log("On " + ref.shorthand() + " (" + ref.target() + ")");

            return repo.getBranchCommit(ref.shorthand());
        }).then(function (commit) {
            var hist = commit.history(),
                p = new Promise(function(resolve, reject) {
                    hist.on("end", resolve);
                    hist.on("error", reject);
                });
            hist.start();
            return p;
        }).then(function (commits) {
            for (var i = 0; i < 3; i++) {
            var sha = commits[i].sha().substr(0,7),
                msg = commits[i].message().split('\n')[0];
            console.log(sha + " " + msg);
            }
        }).then(function() {
            done();
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
                finished();
            });
        }).catch(function(err) {
            nodegit.Clone(conf.repos[reponame].url, utils.workingDir() + reponame, cloneOpts).then((repo) => {
                checkout(repo, conf.repos[reponame].branch, cloneOpts, () => {
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
                console.log(repo, "Done Pulling.");
                callback();
            });
        }, 
        function(err) {            
            if(err)console.log("error",err);
            console.log("\nAll Repos Done Pulling.");
            if(cloneComplete) {
                cloneComplete();
            }
        }
    );
} //end clone
