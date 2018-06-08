var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    var session = req.session;
    if (session.username === undefined) {
        res.redirect('/signin');
        return;
    }
    res.render('index.html', {
        name : session.username
    });
});

router.get('/signout',function(req,res){
    var sess = req.session;
    console.log("Logout request arrived");
    req.session.destroy(function(err){
        
    });
    res.redirect('/')
});

router.get('/signin', function(req, res) {
    var session = req.session;
    if (session.username != undefined) {
        res.redirect('/');
        return;
    }
    res.render('signin.html', {
        name : undefined
    });
});

router.get('/signup', function(req, res) {
    res.render('signup.html', {
        name : undefined
    });
});

module.exports = router;
