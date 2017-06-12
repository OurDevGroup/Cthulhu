var express = require('express');
var app = express();

app.use(express.static('ui/public'));
app.use(require('./ui/routes/index.js'));

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var PORT = 3030;
app.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});