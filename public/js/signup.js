var domain = "http://localhost:3000"
$('#signup-form').submit(function() {
    var input_username = $('#usernameInput').val();
    var input_password = $('#passwordInput').val();
    var input_password_confirm = $('#passwordInputConfirm').val();

    if (input_password != input_password_confirm) {
        alert("Password and confirm field are not same.");
        return true;
    }

    var api_request_url = domain + "/api/user/signup/" + input_username + "/" + input_password + "/" + input_password_confirm;
    var signup_success = false;
    $.post({
        url: api_request_url,
        cache: false,
        async: false
    }).done(function(data) {
        var success = data.success;
        if (success == "true") {
            window.location.href = domain;
            signup_success = true;
        } else {
            alert("An error occurred while signup.");
        }
    }).fail(function() {
        alert("Server failed!");
    });
    // This makes only website refreshed if signup is failed.
    return !signup_success;
});
