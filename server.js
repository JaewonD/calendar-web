var express = require('express');
var app = express();
var router = require('./router/main')(app);

app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use('/api', require('./api/user'))

app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});
