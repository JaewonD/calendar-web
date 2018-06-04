/* ----------------- Constants ----------------- */
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_IN_A_WEEK = 7;

const DOMAIN = "http://localhost:3000";

/* ----------------- Locally fetched data ----------------- */
var personal_schedule_data = [];
var group_schedule_data = {};
var group_ids = [];

/* ----------------- Page initialize ----------------- */
var date = new Date();
date.setDate(date.getDate() - date.getDay());
date.setHours(0, 0, 0, 0);

fetch_and_render_group_info();
refresh_rendered_data();


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
            var cell = document.getElementById("timecell-" + hour_start + "-" + day_offset);
            cell.style.backgroundColor = null;
            cell.style.borderBottomColor = null;
        }
    }
}

function render_personal_schedule() {
    render_schedule(personal_schedule_data);
}

function render_group_schedule() {
    /* Based on the check status, render group schedule. */
    for (var i = 0; i < group_ids.length; i += 1) {
        var group_id = group_ids[i];
        var checkbox = document.getElementById('group-check-' + group_id);
        if (checkbox.checked && group_schedule_data[group_id] != null) {
            render_schedule(group_schedule_data[group_id]);
        }
    }
}

function render_all_schedule() {
    render_personal_schedule();
    render_group_schedule();

}

function render_schedule(data) {
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
                var cell = document.getElementById("timecell-" + hour_start + "-" + day_offset);

                // Check if the cell should be colored
                var target_cell_date = new Date(date);
                target_cell_date.setDate (target_cell_date.getDate() + day_offset);
                target_cell_date.setHours(target_cell_date.getHours() + hour_start);
                if (target_cell_date.getTime() >= start_dt_event_date.getTime() &&
                    target_cell_date.getTime() < end_dt_event_date.getTime()) {
                    cell.style.backgroundColor = colors[i % 3];
                    cell.style.borderBottomColor = colors[i % 3];
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

/* ----------------- Create schedule modal ----------------- */
$('#add-schedule').click(function() {
    if ($('#personal').hasClass('active')) {
        var title = document.getElementById("schedulePersonalTitleInput").value;
        var starttime = document.getElementById("schedulePersonalStartTimeInput").value;
        var endtime = document.getElementById("schedulePersonalEndTimeInput").value;

        if (title == "" || starttime == "" || endtime == "") {
            alert("Some fields are empty");
            return;
        }

        if (starttime > endtime) {
            alert("Start time cannot be after than end time");
            return;
        }

        var api_request_url = DOMAIN + "/api/schedule/personal/" + title + "/" + starttime + "/" + endtime;

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

    } else { // $('#group').hasClass('active')

    }
})
