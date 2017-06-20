var router = require('express').Router();
var dw = require('../../js/dwOCAPI');
var config = require('../../lib/config');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var StaticRouter = require('react-router').StaticRouter;


router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/', function(request, response) {
    response.sendFile("index.html", {"root": __dirname + '/../'});
});

router.post('/login', function(request, response) {
    var jsonStr = '';

    request.on('data', function (data) {
        jsonStr += data;
    });

    request.on('end', function () {
        dw.login(JSON.parse(jsonStr).username, JSON.parse(jsonStr).password, function(jsonString) {
            response.send({message: JSON.parse(jsonString).message, authenticated: JSON.parse(jsonString).authenticated});
        });
    });
});

router.post('/changeSetting', function(request, response) {
    var jsonStr = '';
    var settingName = request.query.settingName;

    request.on('data', function (data) {
        jsonStr += data;
    });

    request.on('end', function () {
        config.save(settingName, JSON.parse(jsonStr), function(message) {
            console.log(config[settingName]);
            if(typeof message != "undefined")
                response.send({message: message, updated: true});
            if(typeof message == "undefined")
                response.send({message: "Setting was not updated!", updated: false});
        });
    });
});

module.exports = router;