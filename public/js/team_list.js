(function($) {
    let editBtn = $("#editTeamsBtn");
    let submitPowerRankingBtn = $("#submitPowerRankingsBtn");
    let count = 0
    let powerRankingInputs = [];
    let currentPowerRankingArr = [];
    var currentPowerRankingDivArr = $(".grid-row-power-ranking"); //gives current power ranking of each team in order of the list
    
    for (i=0; i<currentPowerRankingDivArr.length-1; i++) { //for each entry in the table loop through and extract power ranking and inputs and hide all inputs
        currentPowerRankingArr.push($("#powerRanking"+i))
        powerRankingInputs.push($("#powerRankingInput"+i))
        powerRankingInputs[i].hide()
    }

    editBtn.click(function (event) {
        count += 1
        if(editBtn.html() === "Cancel") {
            editBtn.html("Edit Teams");
        }
        else {
            editBtn.html("Cancel");
        }
        if (count%2==0) { //on second click
            for (j=0; j<powerRankingInputs.length; j++) {
                currentPowerRankingArr[j].show()
                powerRankingInputs[j].hide()
            }
        } else { //on first click
            for (k=0; k<powerRankingInputs.length; k++) {
                powerRankingInputs[k].show()
                currentPowerRankingArr[k].hide()
            }   
        }
    });

    submitPowerRankingBtn.click((event) => {
        event.preventDefault()
        let teamRankObjArr = []
        let teamRankObj = {
            teamName: "",
            district: null,
            newPowerRank: null,
        }

        for (i=0; i<powerRankingInputs.length; i++) { //loop through each input entry in the table, if it's 0 skip, else add team name, district, and updated rank to match obj

            if ($("#powerRankingInput"+i).val() == 0) { //if there is no change
                continue
            } else { //if there is a change
                teamRankObj.teamName = $("#email"+i)[0].innerHTML;
                teamRankObj.district = parseInt($("#districtNum"+i)[0].innerHTML);
                teamRankObj.newPowerRank = parseInt($("#powerRankingInput"+i).val());
                teamRankObjArr.push(teamRankObj);
            }
            teamRankObj = {
                teamName: "",
                district: null,
                newPowerRank: null,
            }
        };

        try {
            let req = {
                method: 'POST',
                url: '/team_list/edit_power_ranking',
                contentType: 'application/json',
                data: JSON.stringify({
                    teamRankObjArr: teamRankObjArr
                })
            };
            $.ajax(req).then(function (res) {
                //page reload on submit
                location.reload();
            });
        } 
        catch (e) {
            console.log(e)
        }
    });

})(window.jQuery);