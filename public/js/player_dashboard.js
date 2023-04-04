(function ($) {
    var joinTeamButton = $("#join_team_button");
    var submitCodeButton = $("#submit_team_code_button");
    var teamCodeInputDiv = $("#div_join_team_input");
    
    teamCodeInputDiv.hide()

    joinTeamButton.click(function () {
        teamCodeInputDiv.show();
    })

    submitCodeButton.click(function (event) {
        event.preventDefault();
        var teamCodeInput = $('#team_code_input');
        let joinCode = parseInt(teamCodeInput.val());
        console.log(joinCode)

        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/join_Team',
                contentType: 'application/json',
                data: JSON.stringify({
                    code: joinCode,
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
    });
})(window.jQuery);