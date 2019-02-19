// Make sure passwords match
// $('#js-confirm-password').on('keyup', function(event) {
//     if ($('#js-password').val() == $('#js-confirm-password').val()) {
//         $('.js-error-message').text('Passwords Match');
//     }
//     else {
//         $('.js-error-message').text(`Passwords don't match`);
//     }
// });

//Listen for user submit
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

        else if (response.status === 422) {
            $('.js-error-message').html(
                `<h3>Oops!</h3> 
                 <p>Phone # must be 10 digits (no hyphens).</p>
                 <p>Password must be between 8 and 72 characters long.</p>`);
        }
        else {
            return response.json()
        }
    })
    .catch(error => console.log('Bad request'));
}