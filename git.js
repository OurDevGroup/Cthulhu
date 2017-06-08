exports.clone = function(repoOptions, callback) {
    var nodegit = require('nodegit');

    var cloneOpts = {
        fetchOpts: {
            callbacks: {
                credentials: function(url, userName) {            
                    return nodegit.Cred.sshKeyNew(
                    userName,
                    repoOptions.publicKey,
                    repoOptions.privateKey,
                    repoOptions.passphrase
                    );
                }
            }
        }
    };

    var checkout = function(repo, callback) {
        repo.checkoutBranch('build');
        if(callback) callback();
    }

    nodegit.Repository.open('./working').then((repo) => {
        console.log("worked");
        checkout(repo, callback);
    }).catch(function(err) {
        nodegit.Clone(repoOptions.repo, './working', cloneOpts).then((repo) => {
            console.log("worked")
            checkout(repo, callback);            
        }).catch(function (err) {
            console.log(err);
        });        
    });


}