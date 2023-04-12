(function ($) {
    var submitSeedsBtn = $("#seed_submit_button");

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
                // seed: parseInt(seed.html())+1,
                seed: seedCount+1,
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