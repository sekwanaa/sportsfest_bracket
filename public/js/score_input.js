(function ($) {
    var scoreInputForm = $('#scoreInputForm');

    scoreInputForm.submit(function (event) {
        event.preventDefault();

        var team1 = $('#team1Name').text();
        var team2 = $('#team2Name').text();
        var team1Score = $('#score1').val();
        var team2Score = $('#score2').val();
        var year = $('#yearPlayed').val();

        try {
            let req = {
                method: 'POST',
                url: '/score_input',
                contentType: 'application/json',
                data: JSON.stringify({
                    team1: team1,
                    team2: team2,
                    score1: team1Score,
                    score2: team2Score,
                    year: year,
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