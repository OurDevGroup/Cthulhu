exports.login = function(username, password, callback) {
    var request = require("request");
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;

    var options = { 
        method: 'POST',
        url: 'https://staging.web.michaels.demandware.net/on/demandware.store/Sites-Site/default/ViewApplication-ProcessLogin',
        headers: {
            'postman-token': 'd8583232-08e2-edfe-2e58-1d5c1135fcb8',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded' },
        form: { 
            LoginForm_Password: password,
            LoginForm_Login: username,
            LocaleID: '',
            LoginForm_RegistrationDomain: 'Sites' 
        },
        rejectUnauthorized: false
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const dom = new JSDOM(body);
        if(dom.window.document.querySelector("#login") !== null) {
            var jsonStr ='{"message":"Login Failed!", "authenticated": false}';
            callback(jsonStr);
        }
        else {
            var jsonStr ='{"message":"' + username + ' has been logged in...", "authenticated": true}';
            callback(jsonStr);
        }
    });
}
