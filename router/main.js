var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    var session = req.session;
    if (session.username === undefined) {
        res.redirect('/signin');
        return;
    }
    res.render('index.html');
});

router.get('/signin', function(req, res) {
    var session = req.session;
    if (session.username != undefined) {
        res.redirect('/');
        return;
    }
    res.render('signin.html');
});

router.get('/signup', function(req, res) {
    res.render('signup.html');
});

module.exports = router;
