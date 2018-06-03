const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_IN_A_WEEK = 7;

var date = new Date();
render_date();

var domain = "http://localhost:3000"

//var api_request_url = domain + "/api/schedule/" + start_date + "/" + end_date;

/*
$.ajax({
    url: api_request_url,
    cache: false,
    async: false
}).done(function(data) {
    var success = data.success;
    if (success == "true") {
        window.location.href = domain;
        login_success = true;
    } else {
        alert("Invalid username or wrong password.");
        login_success = false;
    }
}).fail(function() {
    alert("Server failed!");
});
*/

function render_date() {
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

function go_to_prev_week() {
    date.setDate(date.getDate() - DAYS_IN_A_WEEK);
    render_date();
}

function go_to_next_week() {
    date.setDate(date.getDate() + DAYS_IN_A_WEEK);
    render_date();
}
