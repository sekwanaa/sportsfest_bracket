(function ($) {
    var joinTeamButton = $("#join_team_button");
    var submitCodeButton = $("#submit_team_code_button");
    var teamCodeInputDiv = $("#div_join_team_input");
    
    // user profile card stuff
    var editProfileButton = $("#edit_profile_button");
    var nameUpdateDiv = $("#name_update_div");
    var positionUpdateDiv = $("#position_update_div");
    var shirtNumberUpdateDiv = $("#shirt_number_update_div");
    var playerName = $("#player_name");
    var playerShirtNumber = $("#shirt_number");
    var playerPosition = $("#player_position");
    nameUpdateDiv.hide();
    positionUpdateDiv.hide();
    shirtNumberUpdateDiv.hide();
    let count = 0;


    editProfileButton.click(function() {
        count+=1
        if(editProfileButton.html() === "Cancel") {
            editProfileButton.html("Edit");
        }
        else {
            editProfileButton.html("Cancel");
        }
        if (count%2==0) {
            playerName.show();
            nameUpdateDiv.hide();
            playerShirtNumber.show();
            positionUpdateDiv.hide();
            playerPosition.show();
            shirtNumberUpdateDiv.hide();
        } else {
            playerName.hide();
            nameUpdateDiv.show();
            playerShirtNumber.hide();
            positionUpdateDiv.show();
            playerPosition.hide()
            shirtNumberUpdateDiv.show();
        };
    });

    // team code input div
    teamCodeInputDiv.hide()

    joinTeamButton.click(function () {
        teamCodeInputDiv.show();
    })

    // Submit code button stuff to join a team
    submitCodeButton.click(function (event) {
        event.preventDefault();
        var teamCodeInput = $('#team_code_input');
        let joinCode = parseInt(teamCodeInput.val());
        console.log(joinCode)

        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/join_team',
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