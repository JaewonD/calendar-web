var group_selected_on_modal = "";
var group_owned_schedule_data = {};

var date_on_modal = new Date();
date_on_modal.setDate(date_on_modal.getDate() - date_on_modal.getDay());
date_on_modal.setHours(0, 0, 0, 0);

refresh_rendered_data_on_modal();

$('#scheduleGroupSelectInput').autocomplete({
    source: group_names,
    minLength: 0,
    select: function(event, ui) {
        group_selected_on_modal = ui.item.value;
        $('#scheduleGroupSelected').text("Group selected: " + group_selected_on_modal);
        /* Iterate and find matching ID for given group name */
        var id;
        for (var i = 0; i < group_ids.length; i += 1) {
            var id_in_iteration = group_ids[i]
            if (group_ids_to_names[id_in_iteration] == group_selected_on_modal) {
                id = id_in_iteration;
            }
        }
        $('#scheduleGroupSelectedId').text(id);
        clear_timetable_on_modal();
        render_group_schedule_on_modal();
        ui.item.value = "";
    }
}).on("focus", function() {
    $(this).autocomplete("search");
});

function refresh_rendered_data_on_modal() {
    render_date_label_on_modal();
    clear_timetable_on_modal();
    fetch_and_render_group_schedule_on_modal();
}

function render_date_label_on_modal() {
    var date_iterator = new Date(date_on_modal);
    var day_to_subtract = date_iterator.getDay();

    date_iterator.setDate(date_iterator.getDate() - day_to_subtract);

    var ym_set = new Set();
    for (var i = 0; i < DAYS_IN_A_WEEK; i += 1) {
        var date_text = document.getElementById("date-group-value-" + i);
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
    var ym_label = document.getElementById("ym-label-group");
    ym_label.textContent = month_string;
}

function clear_timetable_on_modal() {
    for (var day_offset = 0; day_offset < DAYS_IN_A_WEEK; day_offset += 1) {
        for (var hour_start = 0; hour_start < 24; hour_start += 1) {
            var cell_id = "timecell-group-" + hour_start + "-" + day_offset;
            var cell = document.getElementById(cell_id);
            cell.style.backgroundColor = null;
            cell.style.borderBottomColor = null;
            $("#" + cell_id).unbind("click");
        }
    }
}

function fetch_and_render_group_schedule_on_modal() {
    var api_request_url_header = DOMAIN + "/api/schedule/groupMemberOwned/";

    var start_date = new Date(date_on_modal);
    var end_date = new Date(date_on_modal);
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
            var group_owned_schedule_data_raw = data.data;
            for (var i = 0; i < group_owned_schedule_data_raw.length; i += 1) {
                var group_id = group_owned_schedule_data_raw[i]["groupid"];
                var group_owned_schedule_data_of_id = group_owned_schedule_data_raw[i]["data"];
                group_owned_schedule_data[group_id] = group_owned_schedule_data_of_id;
            }
            render_group_schedule_on_modal();
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

function render_group_schedule_on_modal() {

    var data = null;
    var id = $('#scheduleGroupSelectedId').text();
    data = group_owned_schedule_data[id];
    if (data == null) {
        return;
    }

    var start_date = new Date(date_on_modal);
    var end_date = new Date(date_on_modal);
    end_date.setDate(end_date.getDate() + DAYS_IN_A_WEEK - 1);

    var colors = ["#7fffd4"];
    for (var i = 0; i < data.length; i += 1) {
        var start_dt_event      = data[i].starttime;
        var start_dt_event_date = new Date(start_dt_event);
        var end_dt_event        = data[i].endtime;
        var end_dt_event_date   = new Date(end_dt_event);

        for (var day_offset = 0; day_offset < DAYS_IN_A_WEEK; day_offset += 1) {
            for (var hour_start = 0; hour_start < 24; hour_start += 1) {
                var target_cell_id = "timecell-group-" + hour_start + "-" + day_offset;
                var cell = document.getElementById(target_cell_id);

                // Check if the cell should be colored
                var target_cell_date = new Date(date_on_modal);
                target_cell_date.setDate (target_cell_date.getDate() + day_offset);
                target_cell_date.setHours(target_cell_date.getHours() + hour_start);
                if (target_cell_date.getTime() >= start_dt_event_date.getTime() &&
                    target_cell_date.getTime() < end_dt_event_date.getTime()) {
                    cell.style.backgroundColor = colors[0];
                    cell.style.borderBottomColor = colors[0];
                }
            }
        }
    }
}

$('#prev-week-button-group').click(function() {
    date_on_modal.setDate(date_on_modal.getDate() - DAYS_IN_A_WEEK);
    refresh_rendered_data_on_modal();
});

$('#next-week-button-group').click(function() {
    date_on_modal.setDate(date_on_modal.getDate() + DAYS_IN_A_WEEK);
    refresh_rendered_data_on_modal();
});



