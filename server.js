var express = require('express');
var app = express();

var session = require('express-session');

app.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true
}));

app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use('/', require('./router/main'));
app.use('/api/user/', require('./api/user'));
app.use('/api/schedule', require('./api/schedule'));
app.use('/api/group', require('./api/group'));

app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});
