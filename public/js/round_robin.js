(function ($) {
    var submitBtn = $('#rrSubmit');
    var totalGames = $('#totalGames');

    submitBtn.click(function (event) {
        event.preventDefault();

        let totalGamesSplit = totalGames.text().split(' ');
        let numOfGames = totalGamesSplit[2];

        let roundRobinMatches = [];
        let matchObj = {};

        for(i=0; i < numOfGames; i++) {
            matchObj.gameNum = $('#gameNum'+i).text();
            matchObj.team1 = $('#team1Name'+i).text();
            matchObj.team2 = $('#team2Name'+i).text();
            matchObj.field = $('#field'+i).text();

            roundRobinMatches.push(matchObj);
            matchObj = {};            
        }

        try {
            let req = {
                method: 'POST',
                url: '/round_robin/round_robin_schedule',
                contentType: 'application/json',
                data: JSON.stringify({
                    roundRobinMatches: roundRobinMatches,
                })
            };
            $.ajax(req).then(function (res) {
                
            });
        } 
        catch (e) {
            console.log(e)
        }

    });
})(window.jQuery);