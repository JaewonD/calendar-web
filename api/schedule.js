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

router.get('/:startdate/:enddate', (req, res) => {
    var sess = req.session;
    var username = sess.username;
    console.log("Username: " + username + " requested schedule info.");
    var startdate = req.params.startdate + " 00:00:00";
    var enddate = req.params.enddate + " 23:59:59";

    pool.query(util.format('SELECT start_time AS starttime, end_time AS endtime, Schedules.name AS scheduleName \
                            FROM Users, Schedules \
                            WHERE Users.id = Schedules.user_id \
                            AND Users.name = "%s" \
                            AND \
                            NOT( (start_time < "%s" AND end_time < "%s") OR (start_time > "%s" AND end_time > "%s") );'
                            , username, startdate, startdate, enddate, enddate), function(err, results, fields) {
        var response = {};
        if (!err) {
            if (results.length == 0) {
                response["success"] = "false";
                response["error"] = "No schedule exists";
                response["data"] = [];
                res.json(response);
                return;
            } else {
                response["success"] = "true";
                response["error"] = "";
                response["data"] = [];
                for (var i = 0; i < results.length; i += 1) {
                    response["data"].push({"starttime": results[i].starttime, "endtime": results[i].endtime, "name": results[i].scheduleName});
                }
                res.json(response);
                return;
            }
        } else {
            console.log(err)
            response["success"] = "false";
            response["error"] = "Internal schedule db error!";
            response["data"] = [];
            res.json(response);
            return;
        }
    });
});

router.post('/personal/:title/:startdate/:enddate', (req, res) => {
    var sess = req.session;
    var username = sess.username;
    var userid = sess.userid;
    console.log("Username: " + username + " requested to create schedule.");
    var startdate = req.params.startdate;
    var enddate = req.params.enddate;
    var title = req.params.title;

    pool.query(util.format('INSERT INTO Schedules(user_id, group_id, start_time, end_time, name) \
                            VALUES("%s", NULL, "%s", "%s", "%s");'
                            , userid, startdate, enddate, title), function(err, results, fields) {
        var response = {};
        if (!err) {
            response["success"] = "true";
            response["error"] = "";
            res.json(response);
            return;
        } else {
            console.log(err)
            response["success"] = "false";
            response["error"] = "Internal schedule db error!";
            res.json(response);
            return;
        }
    });
})
module.exports = router;
