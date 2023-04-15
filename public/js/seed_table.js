(function ($) {
    var submitSeedsBtn = $("#seed_submit_button");
    var refreshSeedTableBtn = $("#refresh_seed_table_button");
    var seedInfo = $("#seed_info_div");

    refreshSeedTableBtn.click(function(event) {
        try {
            let req = {
                method: 'POST',
                url: '/seeding_table/seeds',
                contentType: 'application/json',
                data: JSON.stringify({

                })
            };
            $.ajax(req).then(function (matchHistory) {
                var seedNum = $("#seed0");
                var teamName = $("#teamName0");
                var wins = $("#wins0");
                var losses = $("#losses0");
                var pointDiff = $("#pointDiff0");

                let objCount = 0;

                while(seedNum.length > 0) {
                    seedNum.remove();
                    teamName.remove();
                    wins.remove();
                    losses.remove();
                    pointDiff.remove();

                    objCount++;

                    seedNum = $("#seed"+objCount);
                    teamName = $("#teamName"+objCount);
                    wins = $("#wins"+objCount);
                    losses = $("#losses"+objCount);
                    pointDiff = $("#pointDiff"+objCount);
                    
                }

                for(i=0; i<matchHistory.length; i++) {
                    seedInfo.append('<p id="seed'+i+'">'+i+'</p>')
                    seedInfo.append('<p id="teamName'+i+'">'+matchHistory[i].name+'</p>');
                    seedInfo.append('<p id="wins'+i+'">'+matchHistory[i].winnerCount+'</p>');
                    seedInfo.append('<p id="losses'+i+'">'+matchHistory[i].loserCount+'</p>');
                    seedInfo.append('<p id="pointDiff'+i+'">'+matchHistory[i].pointDifferential+'</p>');
                }
            });
        } 
        catch (e) {
            console.log(e)
        }
    });

    submitSeedsBtn.click(function (event) {
        event.preventDefault();

        let seedCount = 0;

        var seed = $("#seed"+seedCount);
        var teamName = $("#teamName"+seedCount);
        var wins = $("#wins"+seedCount);
        var losses = $("#losses"+seedCount);
        var pointDiff = $("#pointDiff"+seedCount);
        
        let seedsArray = [];
        let seedObj = {};

        while(teamName.length != 0) {
            seedObj = {
                team: teamName.html(),
                wins: parseInt(wins.html()),
                losses: parseInt(losses.html()),
                pointDiff: parseInt(pointDiff.html()),
                seed: parseInt(seed.html()),
                currentPlacement: null,
            }

            seedsArray.push(seedObj);
            seedObj = {};
            seedCount++;
            seed = $("#seed"+seedCount);
            teamName = $("#teamName"+seedCount);
            wins = $("#wins"+seedCount);
            losses = $("#losses"+seedCount);
            pointDiff = $("#pointDiff"+seedCount);
        }

        seedCount = 0;

        try {
            let req = {
                method: 'POST',
                url: '/seeding_table/insertSeeds',
                contentType: 'application/json',
                data: JSON.stringify({
                    seedsArray: seedsArray,
                })
            };
            $.ajax(req).then(function (seedsIdArray) {
                location.reload();
            });
        } 
        catch (e) {
            console.log(e)
        }
    });
})(window.jQuery);