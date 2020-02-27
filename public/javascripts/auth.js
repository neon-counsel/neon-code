$(document).ready(
    function() {
        /**
         * Event handler for when the user attempts to register
         */
        $("#reg-form").submit(function(event) {
            event.preventDefault();

            var pass = $('#inputPassword').val();
            var pass2 = $('#confirmPassword').val();
            var isFail = false;



                  if( !$(this).val() ) {
                        swal('Please fill all fields!');
                        isFail = true;
                        if(pass != pass2){
                            swal('The Passwords Do Not Match!');
                            isFail = true;
                        }
                  }



            if(!isFail)
            {
            $.ajax({
                type: 'POST',
                url: '/users/register',
                dataType: 'json',
                data: {
                    'user_name': event.target.inputUsername.value,
                    'password': event.target.inputPassword.value
                },
                success: function(token) {
                    $(location).attr('href', '/');
                    // Redirect to a login page
                },
                error: function(errMsg) {
                    swal(
                        'Oops...',
                        errMsg.responseJSON.body,
                        'error'
                    )
                }
            });
            }
        });


        $("#log-form").submit(function(event) {
            event.preventDefault();
            $.ajax({
                type: 'POST',
                url: '/users/login',
                dataType: 'json',
                data: {
                    'user_name': event.target.inputUsername.value,
                    'password': event.target.inputPassword.value
                },
                success: function(token) {
                    $(location).attr('href', '/');
                    // Redirect to logged in page
                },
                error: function(errMsg) {
                    swal(
                        'Oops...',
                        errMsg.responseJSON.body,
                        'error'
                    )
                }
            });
        });

    });