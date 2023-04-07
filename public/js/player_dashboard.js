(function ($) {
    var joinTeamButton = $("#join_team_button");
    var submitCodeButton = $("#submit_team_code_button");
    var teamCodeInputDiv = $("#div_join_team_input");

    //initialize items for editing team
    var editTeamButton = $("#edit_team_btn");
    var editTeamSubmitButton = $("#edit_team_submit_btn");
    var editTeamSubmitButtonDiv = $("#div_edit_team_submit_btn");
    var teamDisplayCard = $("#team_display_card");
    var editTeamDisplayCard = $("#edit_team_display_card");
    var editTeamMembersDiv = $("#edit_team_member");

    // user profile card stuff
    var editProfileButton = $("#edit_profile_button");

    // divs which the inputs are in
    var nameUpdateDiv = $("#name_update_div");
    var positionUpdateDiv = $("#position_update_div");
    var shirtNumberUpdateDiv = $("#shirt_number_update_div");

    // original fields with info
    var playerName = $("#player_name");
    var playerShirtNumber = $("#shirt_number");
    var playerPosition = $("#player_position");
    var submitProfileChangesButton = $("#submit_profile_changes_button");
    
    // console.log(playerPosition)
    nameUpdateDiv.hide();
    positionUpdateDiv.hide();
    shirtNumberUpdateDiv.hide();
    submitProfileChangesButton.hide();
    
    let count = 0;

    //hide edit team divs on page load
    editTeamSubmitButtonDiv.hide();
    editTeamDisplayCard.hide();

    //create input fields for making changes to the team
    let teamMemberCount = 0;
    var teamMember = $("#teamMember0");
    
    while(teamMember.length != 0) {
        editTeamMembersDiv.append('<p id="editTeamMemberInput'+teamMemberCount+'" type="text"></p><button id="submit_team_member_change_btn'+teamMemberCount+'">Remove</button></br>');
        $("#editTeamMemberInput"+teamMemberCount).html(teamMember.html());
        teamMemberCount++;
        teamMember = $("#teamMember"+teamMemberCount);
    }

    editProfileButton.click(function() {
        var playerNameInput = $("#player_name_input");
        var playerShirtNumberInput = $("#shirt_number_input");
        var playerPositionInput = $("#player_position_input");
        // console.log(playerPositionInput)
        let playerNameContent = playerName.html();
        let playerShirtNumContent = playerShirtNumber.html();
        let playerPositionContent = playerPosition.html();
        // console.log(playerPositionContent)
        count+=1
        if(editProfileButton.html() === "Cancel") {
            editProfileButton.html("Edit");
        }
        else {
            editProfileButton.html("Cancel");
        }
        if (count%2==0) { //on second click
            playerName.show();
            nameUpdateDiv.hide();
            playerShirtNumber.show();
            positionUpdateDiv.hide();
            playerPosition.show();
            shirtNumberUpdateDiv.hide();
            submitProfileChangesButton.hide()
        } else { //on first click
            // console.log(playerPositionInput.val())
            if (playerNameContent) {
                playerNameInput.val(playerNameContent)
            } else {
                nameUpdateDiv.show()
                playerNameInput.val("No Name Chosen")
            }
            playerName.hide();
            nameUpdateDiv.show();
            playerShirtNumberInput.val(playerShirtNumContent.split(" ")[2])
            playerShirtNumber.hide();
            playerPositionInput.val(playerPositionContent.split(": ")[1])
            positionUpdateDiv.show();
            playerPosition.hide()
            shirtNumberUpdateDiv.show();
            submitProfileChangesButton.show()
        };
    });

    submitProfileChangesButton.click(function () {
        // input fields
        var playerNameInput = $("#player_name_input").val();
        var playerShirtNumberInput = $("#shirt_number_input").val();
        var playerPositionInput = $("#player_position_input").val();
        // console.log(playerNameInput);
        // console.log(playerPositionInput);
        // console.log(playerShirtNumberInput);
        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/submitProfile',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: playerNameInput,
                    shirtNum: parseInt(playerShirtNumberInput),
                    position: playerPositionInput,
                })
            };
            $.ajax(req).then(function (res) {
                // reload the page AFTER everything is done
                // console.log(res)
                location.reload()
            });
        } 
        catch (e) {
            console.log(e)
        }
    });

    // team code input div
    teamCodeInputDiv.hide()

    joinTeamButton.click(function () {
        teamCodeInputDiv.show();
    })

    //when edit Team is clicked, user should see inputs for team info
    editTeamButton.click(function () {

        //take current team info and place them in editable inputs
        $("#edit_team_name").val($("#teamName").html());
        $("#edit_team_captain").val($("#teamCaptain").html());

        //toggle display for edit info for team changes
        if(editTeamButton.html() == "Cancel") {
            editTeamButton.html("Edit Team");
            editTeamSubmitButtonDiv.hide();
            teamDisplayCard.show();
            editTeamDisplayCard.hide();
        }
        else {
            editTeamButton.html("Cancel");
            editTeamSubmitButtonDiv.show();
            editTeamDisplayCard.show();
            teamDisplayCard.hide();

            //take current info and put them into input fields

        }
    });

    //Submit button to POST new team info
    editTeamSubmitButton.click(function () {

        //initialize inputs
        let teamName = null;
        let teamDistrict = null;
        let players = [];
        let teamCaptain = null;
        var teamMember = null;

        //fill players array
        for(i=0; i<teamMemberCount; i++) {
            teamMember = $("#editTeamMemberInput"+i);
            players.push(teamMember.html());
        }


        //ajax POST method to submit
        // try {
        //     let req = {
        //         method: 'POST',
        //         url: '/player_dashboard/editTeam',
        //         contentType: 'application/json',
        //         data: JSON.stringify({
        //             name: teamName,
        //             district: teamDistrict,
        //             players: players,
        //             teamCaptain: teamCaptain,
        //         })
        //     };
        //     $.ajax(req).then(function (res) {
                
        //         //page reload on submit
        //         location.reload();
        //     });
        // } 
        // catch (e) {
        //     console.log(e)
        // }
    });

    // Submit code button stuff to join a team
    submitCodeButton.click(function (event) {
        event.preventDefault();
        var teamCodeInput = $('#team_code_input');
        let joinCode = parseInt(teamCodeInput.val());
        // console.log(joinCode)

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