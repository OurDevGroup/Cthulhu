var router = require('express').Router();
var dw = require('../../js/dwOCAPI');
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
            console.log(JSON.parse(jsonString).authenticated);
            response.send({message: JSON.parse(jsonString).message, authenticated: JSON.parse(jsonString).authenticated});
        });
    });
});

module.exports = router;