(function($) {
    $("#sportsActiveDropdownMenu").toggleClass("hidden sportsActive")
    
    let editBtn = $("#editTeamsBtn");
    let submitPowerRankingBtn = $("#submitPowerRankingsBtn");
    let count = 0
    let powerRankingInputs = [];
    let currentPowerRankingArr = [];
    var currentPowerRankingDivArr = $(".grid-row-power-ranking"); //gives current power ranking of each team in order of the list
    var uploadCSVButton = $("#upload_csv_button");
    var addTeamForm = $("#addTeamForm");


    for (i=0; i<currentPowerRankingDivArr.length-1; i++) { //for each entry in the table loop through and extract power ranking and inputs and hide all inputs
        currentPowerRankingArr.push($("#powerRanking"+i))
        powerRankingInputs.push($("#powerRankingInput"+i))
        powerRankingInputs[i].hide()
    }

    submitPowerRankingBtn.addClass("hidden")
    editBtn.click(function (event) {
        count += 1
        if(editBtn.html() === "Cancel") {
            editBtn.html("Edit Teams");
            submitPowerRankingBtn.addClass("hidden")

        }
        else {
            editBtn.html("Cancel");
            submitPowerRankingBtn.removeClass("hidden")

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

        // console.log(window.location.pathname);
        let teamRankObjArr = []
        let teamRankObj = {
            teamName: "",
            district: null,
            newPowerRank: null,
        }

        //loop through each input entry in the table, if it's 0 skip, else add team name, district, and updated rank to match obj
        for (i=0; i<powerRankingInputs.length-1; i++) { 

            //if there is no change
            if (!$("#powerRankingInput"+i).val()) { 
                continue;
            } 

            //if there is a change
            else { 
                teamRankObj.teamName = $("#teamName"+i)[0].innerHTML;
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
                url: window.location.pathname + '/edit_power_ranking',
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
                // console.log(lines);
                for (let i = 1; i < lines.length; ++i) {
        
                    let tmpString = lines[i].split(',');
                    // console.log(tmpString[0].length);
                    if(tmpString[0].length < 1) {
                        continue;
                    } 
                    else {
                        $('#all_teams_list_csv').append('<div class="csv_info info grid-row-name" id="csv_teamName'+(i-1)+'">'+tmpString[0]+'</div>');
                        $('#all_teams_list_csv').append('<div class="csv_info info grid-row-district" id="csv_districtNum'+(i-1)+'">'+tmpString[1]+'</div>');
                        $('#all_teams_list_csv').append('<div class="csv_info info grid-row-power-ranking" id="csv_powerRanking'+(i-1)+'">'+tmpString[4]+'</div>');               
                    }
                }
            };
            
            reader.readAsText(e.target.files.item(0));
        }

        return false;
    });

    uploadCSVButton.click(function(event) {
        event.preventDefault();
        // console.log("click");
        var teamListTable = $("all_teams_list_csv");

        var header = $(".csv_header");

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

        for(i=0; i<($(".csv_info").length/header.length); i++) {
            teamObj.teamName = $("#csv_teamName" + i).text();
            teamObj.district = parseInt($("#csv_districtNum" + i).text());
            teamObj.players = [];
            teamObj.teamCaptain.name = "blank";
            teamObj.powerRanking = parseInt($("#csv_powerRanking" + i).text());

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

        console.log(teamArray);

        try {
            let req = {
                method: 'POST',
                url: window.location.pathname + '/batch_import_team',
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
    })


    // Show add team modal when "Add Team" button is clicked
    $('#addTeamBtn').click(function() {
        $('#addTeamModal').show();
    });
    
    // Hide modal when "X" is clicked
    $('.close').click(function() {
        $('#addTeamModal').hide();
    });

    $('#uploadCSVBtn').click(function() {
        $('#uploadCSVModal').show();
    });
    
    // Hide modal when "X" is clicked
    $('.close').click(function() {
        $('#uploadCSVModal').hide();
    });

    addTeamForm.submit(function(event){
        event.preventDefault();
        
        try {
            let req = {
                method: 'POST',
                url: window.location.pathname + '/modal_form_import_team',
                contentType: 'application/json',
                data: JSON.stringify({
                    teamArray: {
                        teamName: $("#teamName").val(),
                        district: parseInt($("#district").val()),
                        players: [],
                        teamCaptain: {
                            name: $("#teamCaptain").val(),
                        },
                        powerRanking: parseInt($("#powerRanking").val()),  
                    }
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


