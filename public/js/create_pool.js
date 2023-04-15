(function ($) {
    var poolInputForm = $('#poolInputForm');

    poolInputForm.submit(function (event) {
        event.preventDefault();
        var seedingGames = parseInt($('#seedingGames').val());
        var numOfTeams = parseInt($('#numOfTeams').val());
        var numOfFields = parseInt($('#numOfFields').val());
        var numOfPlayOffTeams = parseInt($('#numOfPlayOffTeams').val());

        try {
            let req = {
                method: 'POST',
                url: '/create_pool',
                contentType: 'application/json',
                data: JSON.stringify({
                    seedingGames: seedingGames,
                    numOfTeams: numOfTeams,
                    numOfFields: numOfFields,
                    numOfPlayOffTeams: numOfPlayOffTeams,
                    stage: 1,
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