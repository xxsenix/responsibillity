// Listens for login submit
function loginEntry() {
    $('.js-login-form').on('submit', function(event) {
        event.preventDefault();
        let user = {};
        user.phoneNumber = $('#js-phoneNumber').val().toString();
        user.password = $('#js-password').val();
        submitLogin(user);
        $('#js-phoneNumber').val('');
        $('#js-password').val('');
    });
}

// Submits login
function submitLogin(user) {
    fetch('api/auth/login',
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(user)
    })
    .then(response => {
        if (response.status === 401) {
            $('.js-error-message').text("Incorrect phone number or password");
        }
        else {
            return response.json();
        }
    })
    .then(data => {
        localStorage.setItem('authToken', data.authToken);
        window.location.href = "/dashboard.html"    ;
    })
    .catch(err => {
        console.log(err);
    })
}

$(loginEntry)