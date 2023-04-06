(function ($) {
    // submit button is no longer part of the form, so we need to change how this works
    var roleChangeForm = $('#roleChangeForm');
    var totalUsers = $('#totalUsers')[0].attributes[1].value
    var roleChangeSubmitButton = $("#button");

    roleChangeSubmitButton.click(function (event) {
        event.preventDefault();

        $('#totalUsers')

        let personArray = [];

        for (i=0;i<totalUsers;i++) {
            // TODO iterate through emails//
            let email = $('#email'+ i +'')[0].textContent
            let role = $('#newRole'+ i + '').val()

            if (role == "") {
                continue;
            }

            let personObject = {
                email: email,
                role: role,
            }

            personArray.push(personObject);
        }

        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/',
                contentType: 'application/json',
                data: JSON.stringify({
                    personArray: personArray,
                })
            };
            $.ajax(req).then(function (res) {
            });
        } 
        catch (e) {
            console.log(e)
        }

        //clear all input fields and reload page
        roleChangeForm[0].reset();
        location.reload();

    });
})(window.jQuery);