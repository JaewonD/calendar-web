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

router.get('/personal/:startdate/:enddate', (req, res) => {
    var sess = req.session;
    var username = sess.username;
    var userid = sess.userid;
    console.log("Username: " + username + " requested schedule info (personal)");
    var startdate = req.params.startdate + " 00:00:00";
    var enddate = req.params.enddate + " 23:59:59";

    pool.query(util.format('SELECT id, start_time AS starttime, end_time AS endtime, name AS scheduleName \
                            FROM Schedules \
                            WHERE user_id = "%s" \
                            AND \
                            NOT( (start_time < "%s" AND end_time < "%s") OR (start_time > "%s" AND end_time > "%s") );'
                            , userid, startdate, startdate, enddate, enddate), function(err, results, fields) {
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
                    response["data"].push({"id": results[i].id, "starttime": results[i].starttime,
                                           "endtime": results[i].endtime, "name": results[i].scheduleName});
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

router.get('/group/:startdate/:enddate', (req, res) => {
    var sess = req.session;
    var username = sess.username;
    var userid = sess.userid;
    console.log("Username: " + username + " requested schedule info (group)");
    var startdate = req.params.startdate + " 00:00:00";
    var enddate = req.params.enddate + " 23:59:59";

    pool.query(util.format('SELECT id, Schedules.group_id AS groupid, start_time AS starttime, end_time AS endtime, name AS scheduleName \
                            FROM Schedules, groups_users \
                            WHERE groups_users.user_id = "%s" \
                            AND Schedules.group_id = groups_users.group_id \
                            AND \
                            NOT( (start_time < "%s" AND end_time < "%s") OR (start_time > "%s" AND end_time > "%s") );'
                            , userid, startdate, startdate, enddate, enddate), function(err, results, fields) {
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

                /* Temporarily use map (response_unformat) to manage data easily */
                var response_unformat = new Map();
                for (var i = 0; i < results.length; i += 1) {
                    var groupid = results[i].groupid;
                    if (!response_unformat.has(groupid)) {
                        response_unformat.set(groupid, []);
                    }
                    response_unformat.get(groupid).push({"id": results[i].id, "starttime": results[i].starttime,
                                                         "endtime": results[i].endtime, "name": results[i].scheduleName});
                }

                for (var [groupid, data] of response_unformat) {
                    response["data"].push({"groupid": groupid, "data": data});
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

router.delete('/:scheduleId', (req, res) => {
    var scheduleId = req.params.scheduleId;
    var sess = req.session;
    var username = sess.username;
    if (username != undefined) {
        pool.query(util.format('DELETE FROM Schedules \
                                WHERE id = "%s";'
                                , scheduleId), function(err, results, fields) {
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
    } else {
        console.log(err)
        response["success"] = "false";
        response["error"] = "Internal schedule db error!";
        res.json(response);
        return;
    }
});

module.exports = router;
