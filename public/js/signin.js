var domain = "http://localhost:3000"
$('#login-form').submit(function() {
    var input_username = $('#usernameInput').val();
    var input_password = $('#passwordInput').val();
    var api_request_url = domain + "/api/user/login/" + input_username + "/" + input_password;
    var login_success = false;
    $.ajax({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            window.location.href = "http://localhost:3000";
            login_success = true;
        } else {
            alert("Invalid username or wrong password.");
            login_success = false;
        }
    }).fail(function() {
        alert("Server failed!");
    });
    // This makes only website refreshed if login is failed.
    return !login_success;
});
