/* ----------------- Constants ----------------- */
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_IN_A_WEEK = 7;

const DOMAIN = "http://localhost:3000";

/* ----------------- Locally fetched data ----------------- */
/* Stores personal/group schedule data on current week - data depends on which week it's viewing */
var personal_schedule_data = [];
var group_schedule_data = {};
/* Stores group ids and names that the user belongs to */
var group_ids = [];
var group_names = [];
/* Stores group id to names that the user belongs to */
var group_ids_to_names = {};
/* Stores all member data fetched from server (should be redesigned due to privacy problem) */
var member_names_to_ids = {};
var member_names = [];
/* Stores name in create-group modal */
var create_group_modal_members = [];
/* Stores cell id to schedule json element */
var cell_to_schedule = {};

/* ----------------- Page initialize ----------------- */
var date = new Date();
date.setDate(date.getDate() - date.getDay());
date.setHours(0, 0, 0, 0);

fetch_all_members();
fetch_and_render_group_info();
refresh_rendered_data();

/* ----------------- Routines related to initialization ----------------- */
function fetch_all_members() {
    var api_request_url = DOMAIN + "/api/user/fetchall/";

    $.ajax({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            var members = data.data;
            for (var i = 0; i < members.length; i += 1) {
                var id = members[i]["id"];
                var name = members[i]["name"];
                member_names.push(name);
                member_names_to_ids[name] = id;
            }
        } else {
            alert("Internal user database error");
        }
    }).fail(function() {
        alert("Server failed!");
    });
}

/* ----------------- Routines related to rendering schedule table ----------------- */
function refresh_rendered_data() {
    render_date_label();
    clear_timetable();
    fetch_and_render_personal_schedule();
    fetch_and_render_group_schedule();
}

function render_date_label() {
    var date_iterator = new Date(date);
    var day_to_subtract = date_iterator.getDay();

    date_iterator.setDate(date_iterator.getDate() - day_to_subtract);

    var ym_set = new Set();
    for (var i = 0; i < DAYS_IN_A_WEEK; i += 1) {
        var date_text = document.getElementById("date-value-" + i);
        date_text.textContent = date_iterator.getDate();
        ym_set.add(date_iterator.getFullYear() + " " + MONTH_NAMES[date_iterator.getMonth()]);
        date_iterator.setDate(date_iterator.getDate() + 1);
    }

    var ym_arr = [...ym_set];
    var month_string = "";
    if (ym_arr.length == 1) {
        month_string = ym_arr[0];
    } else if (ym_arr.length == 2) {
        month_string = ym_arr[0] + " - " + ym_arr[1];
    } else {
        // Error!
        month_string = "Error";
    }
    var ym_label = document.getElementById("ym-label");
    ym_label.textContent = month_string;
}

function fetch_and_render_personal_schedule() {
    var api_request_url_header = DOMAIN + "/api/schedule/personal/";
    personal_schedule_data = [];
    fetch_and_render_schedule(api_request_url_header, true);
}

function fetch_and_render_group_schedule() {
    var api_request_url_header = DOMAIN + "/api/schedule/group/";
    group_schedule_data = {};
    fetch_and_render_schedule(api_request_url_header, false);
}


function fetch_and_render_schedule(api_request_url_header, is_personal) {
    var start_date = new Date(date);
    var end_date = new Date(date);
    end_date.setDate(end_date.getDate() + DAYS_IN_A_WEEK - 1);

    var start_date_str = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate();
    var end_date_str   = end_date.getFullYear()   + "-" + (end_date.getMonth() + 1)   + "-" + end_date.getDate();
    var api_request_url = api_request_url_header + start_date_str + "/" + end_date_str;

    $.ajax({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            if (is_personal) {
                personal_schedule_data = data.data;
                render_personal_schedule();
            } else {
                var group_schedule_data_raw = data.data;
                for (var i = 0; i < group_schedule_data_raw.length; i += 1) {
                    var group_id = group_schedule_data_raw[i]["groupid"];
                    var group_schedule_data_with_id = group_schedule_data_raw[i]["data"];
                    group_schedule_data[group_id] = group_schedule_data_with_id;
                }
                render_group_schedule();
            }
        } else {
            if (data.error == "No schedule exists") {
                // Do nothing
            } else {
                alert("Internal schedule database error");
            }
        }
    }).fail(function() {
        alert("Server failed!");
    });
}

function clear_timetable() {
    for (var day_offset = 0; day_offset < DAYS_IN_A_WEEK; day_offset += 1) {
        for (var hour_start = 0; hour_start < 24; hour_start += 1) {
            var cell_id = "timecell-" + hour_start + "-" + day_offset;
            var cell = document.getElementById(cell_id);
            cell.style.backgroundColor = null;
            cell.style.borderBottomColor = null;
            cell.style.cursor = null;
            $("#" + cell_id).unbind("click");
        }
    }
}

function render_personal_schedule() {
    render_schedule(personal_schedule_data, 0);
}

function render_group_schedule() {
    /* Based on the check status, render group schedule. */
    for (var i = 0; i < group_ids.length; i += 1) {
        var group_id = group_ids[i];
        var checkbox = document.getElementById('group-check-' + group_id);
        if (checkbox.checked && group_schedule_data[group_id] != null) {
            render_schedule(group_schedule_data[group_id], group_id);
        }
    }
}

function render_all_schedule() {
    render_personal_schedule();
    render_group_schedule();

}

function render_schedule(data, group_id) {
    var start_date = new Date(date);
    var end_date = new Date(date);
    end_date.setDate(end_date.getDate() + DAYS_IN_A_WEEK - 1);

    var colors = ["#7fffd4", "#229922", "#1199aa"];
    for (var i = 0; i < data.length; i += 1) {
        var start_dt_event      = data[i].starttime;
        var start_dt_event_date = new Date(start_dt_event);
        var end_dt_event        = data[i].endtime;
        var end_dt_event_date   = new Date(end_dt_event);

        for (var day_offset = 0; day_offset < DAYS_IN_A_WEEK; day_offset += 1) {
            for (var hour_start = 0; hour_start < 24; hour_start += 1) {
                var target_cell_id = "timecell-" + hour_start + "-" + day_offset;
                var cell = document.getElementById(target_cell_id);

                // Check if the cell should be colored
                var target_cell_date = new Date(date);
                target_cell_date.setDate (target_cell_date.getDate() + day_offset);
                target_cell_date.setHours(target_cell_date.getHours() + hour_start);
                if (target_cell_date.getTime() >= start_dt_event_date.getTime() &&
                    target_cell_date.getTime() < end_dt_event_date.getTime()) {
                    cell.style.backgroundColor = colors[i % 3];
                    cell.style.borderBottomColor = colors[i % 3];
                    cell.style.cursor = 'pointer';

                    var schedule = data[i];
                    schedule["groupId"] = group_id;
                    cell_to_schedule[target_cell_id] = schedule;

                    // Implement onClick on cell
                    $("#" + target_cell_id).click(function() {
                        var schedule = cell_to_schedule[this.id];
                        var options = {
                            weekday: "long", year: "numeric", month: "short",
                            day: "numeric", hour: "2-digit", minute: "2-digit"
                        };

                        $("#modal-schedule-detail").modal('show');
                        $("#modal-schedule-title").text(schedule.name);
                        $("#modal-schedule-id").text(schedule.id);
                        $("#schedule-detail-start-time").text(new Date(schedule.starttime).toLocaleTimeString("en-US", options));
                        $("#schedule-detail-end-time")  .text(new Date(schedule.endtime).toLocaleTimeString("en-US", options))
                        if (schedule.groupId != 0) {
                            $("#schedule-info-group-name").text(group_ids_to_names[schedule.groupId]);
                        } else {
                            $("#schedule-info-group-name").text("No group");
                        }
                    });
                }
            }
        }
    }
}


/* ----------------- Routines related to group info ----------------- */
function fetch_and_render_group_info() {
    var api_request_url = DOMAIN + "/api/group/";

    $.ajax({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            render_group_info(data.data);
        } else {
            alert("Internal group database error");
        }
    }).fail(function() {
        alert("Server failed!");
    });
}

function render_group_info(group_info) {
    for (var i = 0; i < group_info.length; i += 1) {
        var group_id   = group_info[i]["groupId"];
        var group_name = group_info[i]["groupName"];
        group_ids.push(group_id);
        group_names.push(group_name);
        group_ids_to_names[group_id] = group_name;

        var checkbox_id = "group-check-" + group_id;
        $('#group-list').append(
            `
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="${checkbox_id}">
              <label class="custom-control-label" for="${checkbox_id}">${group_name}</label>
            </div>
            `
        );
        $('#' + checkbox_id).click(function() {
            clear_timetable();
            render_all_schedule();
        })
    }
}

/* ----------------- Add click listener ----------------- */
$('#prev-week-button').click(function() {
    date.setDate(date.getDate() - DAYS_IN_A_WEEK);
    refresh_rendered_data();
});

$('#next-week-button').click(function() {
    date.setDate(date.getDate() + DAYS_IN_A_WEEK);
    refresh_rendered_data();
});

/* ----------------- Create-schedule modal ----------------- */
$('#add-schedule').click(function() {
    var title, starttime, endtime, api_request_url;
    var groupid;

    if ($('#personal').hasClass('active')) {
        title = document.getElementById("schedulePersonalTitleInput").value;
        starttime = document.getElementById("schedulePersonalStartTimeInput").value;
        endtime = document.getElementById("schedulePersonalEndTimeInput").value;
        api_request_url = DOMAIN + "/api/schedule/personal/" + title + "/" + starttime + "/" + endtime;
    } else { // $('#group').hasClass('active')
        title = document.getElementById("scheduleGroupTitleInput").value;
        starttime = document.getElementById("scheduleGroupStartTimeInput").value;
        endtime = document.getElementById("scheduleGroupEndTimeInput").value;
        groupid = $('#scheduleGroupSelectedId').text();
        if (groupid == "ID value that is hidden") {
            alert("You must select a group.");
            return;
        }
        api_request_url = DOMAIN + "/api/schedule/group/" + groupid + "/" + title + "/" + starttime + "/" + endtime;
    }

    if (title == "" || starttime == "" || endtime == "") {
        alert("Some fields are empty");
        return;
    }

    if (starttime > endtime) {
        alert("Start time cannot be after than end time");
        return;
    }

    $.post({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            window.location.reload();
        } else {
            alert("Internal schedule database error");
        }
    }).fail(function() {
        alert("Server failed!");
    });
});

/* ----------------- Create-group modal ----------------- */
$('#groupMemberInput').autocomplete({
    source: member_names,
    minLength: 0,
    select: function(event, ui) {
        var name = ui.item.value;
        var id = member_names_to_ids[name];
        if (create_group_modal_members.includes(name)) {
            alert("The name already exists!");
            return;
        }
        $('#groupMemberList').append(
            `
            <li class="list-group-item list-group-item-action add-group-members" id="add-group-members-${id}">${name}</li>
            `
        );
        create_group_modal_members.push(name);
        ui.item.value = "";
    }
}).on("focus", function() {
    $(this).autocomplete("search");
});

$('#add-group').click(function() {
    var groupname = document.getElementById("groupNameInput").value;

    if (groupname == "") {
        alert("Group name is required field.");
        return;
    }

    if (create_group_modal_members.length == 0) {
        alert("At least one member should be invited to the group");
        return;
    }

    var members_html = document.getElementsByClassName("add-group-members");
    var member_ids = [];
    for (var i = 0; i < members_html.length; i += 1) {
        member_ids.push(members_html[i].id.substring(18));
    }

    var api_request_url = DOMAIN + "/api/group/add/" + groupname + "/" + member_ids.join("|");
    console.log(api_request_url);

    $.post({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            window.location.reload();
        } else {
            alert("Internal group database error");
        }
    }).fail(function() {
        alert("Server failed!");
    });
});


/* ----------------- Event-detail modal ----------------- */
$('#modal-schedule-detail-delete').click(function() {
    var scheduleId = $('#modal-schedule-id').text();

    var api_request_url = DOMAIN + "/api/schedule/" + scheduleId;
    console.log(api_request_url);

    $.ajax({
        url: api_request_url,
        type: 'DELETE',
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            window.location.reload();
        } else {
            alert("Internal schedule database error");
        }
    }).fail(function() {
        alert("Server failed!");
    });
});

