$(document).ready(function () {
    $("#buttonLogin").click(function () {
        window.location = "/users/login";

    });
    $("#buttonRegister").click(function () {
        window.location = "/users/register";

    });

    $("#buttonStar").click(function () {
        $.ajax({
            type: 'POST',
            url: $("#buttonStar").val()+'/star',
            dataType: 'json',
            data: {
            },
            success: function(token) {
                console.log("SUCCESS");
                //$(location).attr('href', token.redirect);
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

    $("#createProject").click(function () {
        console.log($('input[name="privacy"]:checked').val());
        $.ajax({
            type: 'POST',
            url: '/projects/new',
            dataType: 'json',
            data: {
                'project_name': $("#text").val(),
                'description': $("#desc").val(),
                'privacy': $('input[name="privacy"]:checked').val()
            },
            success: function(token) {
                $(location).attr('href', token.redirect);
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

