(function ($) {
    // $(":button").click(function() {
    //     console.log($(this).attr("class"))
    // })

    $(":button").click(function (event) {
        var submitButtonNumber = $(this).attr("class")
        var scoreInputForm = $('#scoreInputForm'+submitButtonNumber);
        event.preventDefault();

        var team1 = $("#court"+submitButtonNumber+'team1Name').text();
        var team2 = $("#court"+submitButtonNumber+'team2Name').text();
        var team1Score = parseInt($("#court"+submitButtonNumber+'score1').val());
        var team2Score = parseInt($("#court"+submitButtonNumber+'score2').val());
        var fieldNum = $('#court'+submitButtonNumber).text();
        // don't need year because it's in the court view route

        let winner = "";
        let loser = "";
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