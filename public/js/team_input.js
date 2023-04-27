(function ($) {
    var addMoreButton = $('#add_more_button');
    var removeMember = $('#remove_button');
    var teamInputForm = $('#teamInputForm');
    var createTeamButton = $('#create_team_button');
    var i = 2;
    var teamMemberCount = i;
    

    teamInputForm.hide();
    removeMember.hide();

    createTeamButton.click(function () {
        teamInputForm.show();
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
        var teamName = $('#teamName').val();
        var district = $('#districtSelection').val();
        var teamCaptain = $('#teamCaptain').val();
        var teamCaptainShirtNum = $('#shirt_number').text();
        let teamMembers = [];
        

        for(i = 1; i < teamMemberCount; i++) {
            let playerData = {};
            playerData.name = $("#teamMemberName" + i).val();
            playerData.shirtNum = null;
            playerData.userId = null,
            playerData.hasTeam = true,
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
                        hasTeam: true,
                        linked: true,
                    },
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
        teamInputForm[0].reset();
        createTeamButton.hide()
        teamInputForm.hide()
    });
})(window.jQuery);