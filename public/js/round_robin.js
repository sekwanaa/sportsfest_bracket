(function ($) {
    var generaterrBtn = $("#rrGenerateRoundRobin");
    var submitBtn = $('#rrSubmit');
    var totalGames = $('#totalGames');
    var roundRobinGrid = $('#roundRobinGrid');
    var completeRoundRobinBtn = $("#completeRoundRobinButton");

    generaterrBtn.click(function (event) {
        if(generaterrBtn.html() == "Create Schedule") {
            generaterrBtn.html("Refresh Schedule");
        }
        try {
            let req = {
                method: 'POST',
                url: '/round_robin',
                contentType: 'application/json',
                data: JSON.stringify({
                    
                })
            };
            $.ajax(req).then(function (roundRobinArray) {
                console.log(roundRobinArray.length);
                totalGames.html(roundRobinArray.length);

                if(totalGames.html() > 0) {
                    for(i=0; i<totalGames.html(); i++) {
                        $("#gameNum"+i).remove();
                        $("#team1Name"+i).remove();
                        $("#team2Name"+i).remove();
                        $("#field"+i).remove();
                    }
                }

                for(i=0; i<roundRobinArray.length; i++) {
                    roundRobinGrid.append('<div class="grid-row-name" id="gameNum'+i+'">'+roundRobinArray[i].gameNum+'</div>');
                    roundRobinGrid.append('<div class="grid-row-name" id="team1Name'+i+'">'+roundRobinArray[i].team1.teamName+'</div>');
                    roundRobinGrid.append('<div class="grid-row-name" id="team2Name'+i+'">'+roundRobinArray[i].team2.teamName+'</div>');
                    roundRobinGrid.append('<div class="grid-row-name" id="field'+i+'">'+roundRobinArray[i].field+'</div>');
                }

            });
        } 
        catch (e) {
            console.log(e)
        }
    });

    completeRoundRobinBtn.click(function (event) {
        event.preventDefault();
        // console.log("clicked");

        try {
            let req = {
                method: 'POST',
                url: '/round_robin/round_robin_complete',
                contentType: 'application/json',
                data: JSON.stringify({
                    roundRobinMatches: matchObj,
                })
            };
            $.ajax(req).then(function (res) {
                
            });
        } catch (e) {
            console.log(e);
        }
    });

    submitBtn.click(function (event) {
        event.preventDefault();

        let totalGamesSplit = totalGames.text().split(' ');
        let numOfGames = totalGamesSplit[2];

        // let roundRobinMatches = [];
        let matchObj = {};

        for(i=0; i < numOfGames; i++) {
            matchObj.gameNum = $('#gameNum'+i).text();
            matchObj.team1 = $('#team1Name'+i).text();
            matchObj.team2 = $('#team2Name'+i).text();
            matchObj.field = $('#field'+i).text();
            matchObj.complete = false;

            // roundRobinMatches.push(matchObj);

            try {
                let req = {
                    method: 'POST',
                    url: '/round_robin/round_robin_schedule',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        roundRobinMatches: matchObj,
                    })
                };
                $.ajax(req).then(function (res) {
                    
                });
            } 
            catch (e) {
                console.log(e)
            }

            matchObj = {};            
        }
    });
})(window.jQuery);