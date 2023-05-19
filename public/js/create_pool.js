(function ($) {
    var poolInputForm = $('#poolInputForm');

    poolInputForm.submit(function (event) {
        event.preventDefault();
        // var seedingGames = parseInt($('#seedingGames').val());
        // var numOfFields = parseInt($('#numOfFields').val());
        // var numOfPlayOffTeams = parseInt($('#numOfPlayOffTeams').val());

        var nameOfTournament = $("#nameOfTournament").val();
        let sports = [];

        //get sports data from form: sport, numOfFields, numOfPlayoffTeams, numOfSeedingGames
        //push to sports array

        let poolObj = {
            name: nameOfTournament,
            sports: sports,
            stage: 1,
        }

        try {
            let req = {
                method: 'POST',
                url: '/player_dashboard/create_pool',
                contentType: 'application/json',
                data: JSON.stringify({
                    poolObj: poolObj,
                })
            };
            $.ajax(req).then(function (res) {

            });
        } 
        catch (e) {
            console.log(e)
        }

        //clear all input fields
        poolInputForm[0].reset();
    });
})(window.jQuery);