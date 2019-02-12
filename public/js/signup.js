// Make sure passwords match
$('#js-password, #js-confirm-password').on('keyup', function(event) {
    if ($('#js-password').val() == $('#js-confirm-password').val()) {
        $('#js-error-message').html('Passwords Match');
    }
    else {
        $('#js-error-message').html(`Passwords don't match`);
    }
});

//Listen for user submit

$('.js-submit-form').on('click', '#js-submit-button', function(event) {
    event.preventDefault();
    let newUser = {};
    newUser.phoneNumber = $('#js-phoneNumber').val().toString();
    newUser.password = $('#js-password').val();
    console.log(newUser);
    submitUser(newUser);
    $('#js-phoneNumber').val('');
    $('#js-password').val('');
    $('#js-confirm-password').val('');
});

function submitUser(newUser) {
    fetch('/api/users',
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (response.status === 201) {
            window.location.href = "/login.html"
        }
        else {
            return response.json()
        }
    })
    .catch(error => console.log('Bad request'));
}