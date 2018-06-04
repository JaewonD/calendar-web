const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_IN_A_WEEK = 7;

var date = new Date();
date.setDate(date.getDate() - date.getDay());

render_data();


function render_data() {
    render_date_label();
    render_schedule();
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

function render_schedule() {
    var domain = "http://localhost:3000";
    var start_date = new Date(date);
    var end_date = new Date(date);
    end_date.setDate(end_date.getDate() + DAYS_IN_A_WEEK - 1);

    var start_date_str = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate();
    var end_date_str   = end_date.getFullYear()   + "-" + (end_date.getMonth() + 1)   + "-" + end_date.getDate();
    var api_request_url = domain + "/api/schedule/" + start_date_str + "/" + end_date_str;

    clear_timetable();

    $.ajax({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            render_timetable(start_date, end_date, data.data);
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

function render_timetable(start_date, end_date, data) {
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

function go_to_prev_week() {
    date.setDate(date.getDate() - DAYS_IN_A_WEEK);
    render_data();
}

function go_to_next_week() {
    date.setDate(date.getDate() + DAYS_IN_A_WEEK);
    render_data();
}
