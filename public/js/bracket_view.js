(function ($) {
    // $(":button").click(function() {
    //     console.log($(this).attr("class"))
    // }}
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
})(window.jQuery);