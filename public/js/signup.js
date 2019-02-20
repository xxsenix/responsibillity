// Listen for user submit
$('.js-submit-form').on('click', '#js-submit-button', function(event) {
    event.preventDefault();
    let newUser = {};
    newUser.phoneNumber = parseInt($('#js-phoneNumber').val());
    newUser.password = $('#js-password').val();
    console.log(newUser);
    submitUser(newUser);
    $('#js-phoneNumber').val('');
    $('#js-password').val('');
    $('#js-confirm-password').val('');
});
// Sends user info to /api/users
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

        // else if (response.status === 422) {
        //     console.log('response', response);
        //     $('.js-error-message').text(response.message);
        //     $('.js-error-message').html(
        //         `<h3>Oops!</h3> 
        //          <p>Phone # must be 10 digits (no hyphens).</p>
        //          <p>Password must be between 8 and 72 characters long.</p>`);
        // }
        else {
            return response.json()
        }

    })
    .then(response => {
        $('.js-error-message').text(response.message)
    })
    .catch(error => console.log('Bad request'));
}