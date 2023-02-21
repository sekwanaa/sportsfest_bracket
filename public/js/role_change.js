(function ($) {
    var roleChangeForm = $('#roleChangeForm');
    var totalUsers = $('#totalUsers')[0].attributes[1].value

    roleChangeForm.submit(function (event) {
        event.preventDefault();
        console.log("test")

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