(function ($) {
    var roleChangeForm = $('#roleChangeForm');
    var totalUsers = $('#totalUsers')

    roleChangeForm.submit(function (event) {
        event.preventDefault();
        for (i=0;i<totalUsers;i++) {
            // TODO iterate through emails//
        }
        var email = 'poop';
        var role = $('#role').val();
        
        try {
            let req = {
                method: 'POST',
                url: '/role_change/',
                contentType: 'application/json',
                data: JSON.stringify({
                    role: role,
                })
            };
            $.ajax(req).then(function (res) {
                console.log("Team Added")
                console.log("Team ID: " + res);
            });
        } 
        catch (e) {
            console.log(e)
        }

        //clear all input fields
        roleChangeForm[0].reset();
    });
})(window.jQuery);