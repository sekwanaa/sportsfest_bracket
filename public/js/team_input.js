(function ($) {
    var joinTeamButton = $("#join_team_button");
    var addMoreButton = $('#add_more_button');
    var removeMember = $('#remove_button');
    var teamInputForm = $('#teamInputForm');
    var createTeamButton = $('#create_team_button');
    var i = 2;
    var teamMemberCount = i;
    let createTeamClickCount = 0;
    

    teamInputForm.hide();
    removeMember.hide();

    createTeamButton.click(function () {
        createTeamClickCount += 1;
        if(createTeamButton.html() === "Cancel") {
            createTeamButton.html("Create a Team");
        }
        else {
            createTeamButton.html("Cancel");
        }

        if (createTeamClickCount % 2 == 0) {
            teamInputForm.hide();
            joinTeamButton.show();
        } else {
            teamInputForm.show();
            joinTeamButton.hide();

        };
        
    })
    
    addMoreButton.click(function () {
        removeMember.show()
        const div = $("#teamMembersList");
        div.append('<input id="teamMemberName' + i++ +'" type="text" placeholder="Team Member Name"></input>');
        teamMemberCount = i;
    });

    removeMember.click(function () {
        if (i==3) {
            $(this).hide()
        }
        i -= 1
        const input = $("#teamMemberName" + i);
        input.remove();
        teamMemberCount = i;
    });

    teamInputForm.submit(function (event) {
        event.preventDefault();
        
        // var tournamentId = $('#team_tournament_name_class')[0].id;
        var sportId = $('.team_sport_name_class')[0].id;
        var teamName = $('#teamName').val();
        var district = parseInt($('#districtSelection').val());
        var teamCaptain = $('#teamCaptain').val();
        var teamCaptainShirtNum = $('#shirt_number').text();
        let teamMembers = [];

        console.log(teamName);
        
        for(i = 1; i < teamMemberCount; i++) {
            let playerData = {};
            playerData.name = $("#teamMemberName" + i).val();
            playerData.shirtNum = null;
            playerData.userId = null,
            // playerData.hasTeam = true,
            playerData.linked = false,
            teamMembers.push(playerData);
        }

        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/submitTeams',
                contentType: 'application/json',
                data: JSON.stringify({
                    teamName: teamName,
                    district: district,
                    players: teamMembers,
                    teamCaptain: {
                        name: teamCaptain,
                        shirtNum: teamCaptainShirtNum,
                        userId: null,
                        // hasTeam: true,
                        linked: true,
                    },
                    // tournamentId: tournamentId,
                    sportId: sportId,
                })
            };
            $.ajax(req).then(function (res) {
                
            });
        } 
        catch (e) {
            console.log(e)
        }

        //clear all input fields
        teamInputForm[0].reset();
        createTeamButton.hide()
        teamInputForm.hide()
    });
})(window.jQuery);