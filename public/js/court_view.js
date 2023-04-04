(function ($) {
    var scoreInputForm = $('#scoreInputForm');

    scoreInputForm.submit(function (event) {
        event.preventDefault();

        var team1 = $('#team1Name').text();
        var team2 = $('#team2Name').text();
        var team1Score = parseInt($('#score1').val());
        var team2Score = parseInt($('#score2').val());
        var fieldNum = $('#court1').text();
        // don't need year because it's in the court view route

        let winner = "";
        let loser = "";
        let pointDifferential = "";
        let winnerPointDifferential = "";
        let loserPointDifferential = "";

        if (team1Score > team2Score) {
            winner = team1;
            loser = team2;
            winnerPointDifferential = team1Score - team2Score;
            loserPointDifferential = team2Score - team1Score;
        }
        else {
            winner = team2;
            loser = team1;
            winnerPointDifferential = team2Score - team1Score;
            loserPointDifferential = team1Score - team2Score;
        }

        try {
            let req = {
                method: 'POST',
                url: '/court_view',
                contentType: 'application/json',
                data: JSON.stringify({
                    team1: team1,
                    team2: team2,
                    score1: team1Score,
                    score2: team2Score,
                    winner: winner,
                    loser: loser,
                    fieldNum: fieldNum,
                    winnerPointDifferential: winnerPointDifferential,
                    loserPointDifferential: loserPointDifferential,
                })
            };
            $.ajax(req).then(function (res) {
                
            });
        } 
        catch (e) {
            console.log(e)
        }

        //clear all input fields
        scoreInputForm[0].reset();
    });
})(window.jQuery);