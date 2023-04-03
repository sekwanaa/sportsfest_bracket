(function ($) {
    var scoreInputForm = $('#scoreInputForm');

    scoreInputForm.submit(function (event) {
        event.preventDefault();

        var team1 = $('#team1Name').text();
        var team2 = $('#team2Name').text();
        var team1Score = $('#score1').val();
        var team2Score = $('#score2').val();
        // don't need year because it's in the court view route

        let winner = "";
        let loser = "";
        let pointDifferential = "";
        let team1PointDifferential = "";
        let team2PointDifferential = "";

        if (team1Score > team2Score) {
            winner = team1;
            loser = team2;
            team1PointDifferential = team1Score - team2Score;
            team2PointDifferential = -(team1Score - team2Score);
        }
        else {
            winner = team2;
            loser = team1;
            team1PointDifferential = team2Score - team1Score;
            team2PointDifferential = -(team2Score - team1Score);
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
                    team1PointDifferential: team1PointDifferential,
                    team2PointDifferential: team2PointDifferential,
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