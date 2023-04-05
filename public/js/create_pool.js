(function ($) {
    var poolInputForm = $('#poolInputForm');

    poolInputForm.submit(function (event) {
        event.preventDefault();
        var seedingGames = $('#seedingGames').val();
        var numOfTeams = $('#numOfTeams').val();
        var numOfFields = $('#numOfFields').val();
        var numOfPlayOffTeams = $('#numOfPlayOffTeams').val();

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