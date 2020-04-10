$(document).ready(
    function() {
        $('#vscode-editor').on('load', function() {
            alert('frame has (re)loaded ');
        });

        /**
         * Event handler for when the user attempts to register
         */
         var isFail = false;
        $("#reg-form").submit(function(event) {
            event.preventDefault();




                  var pass = $('#inputPassword').val();
                  var pass2 = $('#confirmPassword').val();

                  if(pass != pass2){
                        swal('The Passwords Do Not Match!');
                         isFail = true;
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

        $('#inputPassword').keyup(function(e) {
             var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
             var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
             var enoughRegex = new RegExp("(?=.{9,}).*", "g");
             if (false == enoughRegex.test($(this).val())) {
                     $('#passstrength').html('Password Should Contain 9 characters');
                     isFail = true;
             } else if (strongRegex.test($(this).val())) {
                     $('#passstrength').className = 'ok';
                     $('#passstrength').html('Strong Password!');
                     isFail = false;

             } else if (mediumRegex.test($(this).val())) {
                     $('#passstrength').className = 'alert';
                     $('#passstrength').html('Password Should contain <br/> Uppercase, Lowercase, number and symbol!');
                     isFail = true;
             } else {
                     $('#passstrength').className = 'error';
                     $('#passstrength').html('Password Should contain <br/> Uppercase, Lowercase, number and symbol!');
                     isFail = true;
             }
        });

    });