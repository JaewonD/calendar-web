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

router.get('/', (req, res) => {
    var sess = req.session;
    var username = sess.username;
    var userid = sess.userid;
    console.log("Username: " + username + " requested group info.");

    pool.query(util.format('SELECT Groups.id AS groupId, Groups.name AS groupName \
                            FROM Groups, groups_users \
                            WHERE Groups.id = groups_users.group_id \
                            AND groups_users.user_id = "%s";'
                            , userid), function(err, results, fields) {
        var response = {};
        if (!err) {
            response["success"] = "true";
            response["error"] = "";
            response["data"] = [];
            for (var i = 0; i < results.length; i += 1) {
                response["data"].push({"groupId": results[i].groupId, "groupName": results[i].groupName});
            }
            res.json(response);
            return;
        } else {
            console.log(err)
            response["success"] = "false";
            response["error"] = "Internal group db error!";
            response["data"] = [];
            res.json(response);
            return;
        }
    });
});

module.exports = router;
