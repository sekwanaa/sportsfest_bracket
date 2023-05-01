(function($) {
    $("#tournamentList").toggleClass("hidden")
    $("#sportsActiveDropdownMenu").toggleClass("hidden sportsActive")
    
    let editBtn = $("#editTeamsBtn");
    let submitPowerRankingBtn = $("#submitPowerRankingsBtn");
    let count = 0
    let powerRankingInputs = [];
    let currentPowerRankingArr = [];
    var currentPowerRankingDivArr = $(".grid-row-power-ranking"); //gives current power ranking of each team in order of the list
    var uploadCSVButton = $("#upload_csv_button");
    
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

    $("#filename").change(function(e) {
        var ext = $("input#filename").val().split(".").pop().toLowerCase();
        if($.inArray(ext, ["csv"]) == -1) {
            alert('Upload CSV');
            return false;
        }

        if (e.target.files != undefined) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var lines = e.target.result.split('\r\n');
                for (i = 1; i < lines.length; ++i) {
        
                    let tmpString = lines[i].split(',');
                    console.log(tmpString[0].length);
                    if(tmpString[0].length < 1) {
                        continue;
                    }else {
                        $('#test_list').append('<div class="info grid-row-name" id="email'+(i-1)+'">'+tmpString[0]+'</div>');
                        $('#test_list').append('<div class="info grid-row-district" id="districtNum'+(i-1)+'">'+tmpString[1]+'</div>');
                        $('#test_list').append('<div class="info grid-row-power-ranking" id="powerRanking'+(i-1)+'">'+tmpString[4]+'</div>');               
                    }
                }
            };
            
            reader.readAsText(e.target.files.item(0));
        }

        return false;
    });

    uploadCSVButton.click(function(event) {
        event.preventDefault();
        console.log("click");
        var teamListTable = $("test_list");

        var header = $(".header");

        let teamArray = [];
        let teamObj = {
            teamName: null,
            district: null,
            players: [],
            teamCaptain: {
                name: "blank",
            },
            powerRanking: null,  
        }

        for(i=0; i<($(".info").length/header.length); i++) {
            // console.log($("#email" + i)[0].innerHTML);
            // console.log($("#districtNum" + i)[0].innerHTML);
            // console.log($("#powerRanking" + i)[0].innerHTML);

            teamObj.teamName = $("#email" + i)[0].innerHTML;
            teamObj.district = parseInt($("#districtNum" + i)[0].innerHTML);
            teamObj.players = [];
            teamObj.teamCaptain.name = "blank";
            teamObj.powerRanking = parseInt($("#powerRanking" + i)[0].innerHTML);

            teamArray.push(teamObj);

            teamObj = {
                teamName: null,
                district: null,
                players: [],
                teamCaptain: {
                    name: "blank",
                },
                powerRanking: null,
            }
        }

        try {
            let req = {
                method: 'POST',
                url: '/team_list/batch_import_team',
                contentType: 'application/json',
                data: JSON.stringify({
                    teamArray: teamArray
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
        // console.log(teamArray);
    })


})(window.jQuery);