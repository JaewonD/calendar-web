var express = require('express');
var mysql = require('mysql');
var dbConfig = require('../config/db-config');
var util = require("util");

var pool = mysql.createPool({connectionLimit: 10, 
                             host:            dbConfig.host, 
                             user:            dbConfig.user, 
                             password:        dbConfig.password, 
                             database:        dbConfig.database,
                             port:            3333});

var router = express.Router();

router.get('/login/:username/:password', (req, res) => {
    var username = req.params.username;
    var password = req.params.password;
    var sess = req.session;
    console.log("Login request arrived");
    pool.query(util.format('SELECT * FROM Users WHERE name = "%s";', username), function(err, results, fields) {
        var response = {};
        if (!err) {
            if (results.length == 0) {
                response["success"] = "false";
                response["error"] = "Username not found";
                res.json(response);
                return;
            }
            var password_db = results[0].pwd;
            if (password_db == password) {
                console.log("Successful login")
                response["success"] = "true";
                response["error"] = "";
                sess.username = username;
                res.json(response);
                return;
            } else {
                response["success"] = "false";
                response["error"] = "Password not match";
                res.json(response);
                return;
            }
        } else {
            console.log(err)
            response["success"] = "false";
            response["error"] = "Internal login server error!";
            res.json(response);
            return;
        }
    });
});

router.get('/logout', (req, res) => {
    var sess = req.session;
    console.log("Logout request arrived");
    req.session.destroy(function(err){
        
    });
    res.json({"success":"true"});
    return;
})

module.exports = router;
