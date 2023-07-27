(function ($) {
    $("#sportsActiveDropdownMenu").toggleClass("hidden sportsActive")

    var generaterrBtn = $("#rrGenerateRoundRobin");
    var submitBtn = $('#rrSubmit');
    var totalGames = $('#totalGames');
    var roundRobinGrid = $('#roundRobinGridInfo');
    var completeRoundRobinBtn = null;
    var downloadCSVButton = $("#downloadCSVBtn");
    var poolSelection = $("#pool_algorithm_input");
    var baseUrl = window.location.pathname;
    let errorDialog = $('.errorDialog')

    if ($("#completeRoundRobinButton").length > 0) {
        completeRoundRobinBtn = $("#completeRoundRobinButton");
    }

    generaterrBtn.click(function (event) {

        let selection = poolSelection.val();
        // console.log(window.location.pathname);

        // let url = window.location.pathname.split("/");

        // console.log(url);

        // let id = url[2];
        // let sport = url[3];

        if (generaterrBtn.html() == "Create Schedule") {
            generaterrBtn.html("Refresh Schedule");
        }
        try {
            let req = {
                method: 'POST',
                url: baseUrl,
                contentType: 'application/json',
                data: JSON.stringify({
                    selection: selection,
                    // id: id,
                    // sport: sport,
                })
            };
            $.ajax(req).then(function (roundRobinArray) {
                try {
                    if(!Array.isArray(roundRobinArray)) throw roundRobinArray;
                    
                    let previousTotalGamesLength = totalGames.html();
                    totalGames.html(roundRobinArray.length);
    
                    if (totalGames.html() > 0) {
                        for (i = 0; i < previousTotalGamesLength; i++) {
                            $("#gameNum" + i).remove();
                            $("#team1Name" + i).remove();
                            $("#team2Name" + i).remove();
                            $("#field" + i).remove();
                            $("#ref1" + i).remove();
                            $("#ref2" + i).remove();
                        }
                    }
    
                    for (i = 0; i < roundRobinArray.length; i++) {
                        roundRobinGrid.append('<div class="grid-row-name" id="gameNum' + i + '">' + roundRobinArray[i].gameNum + '</div>');
                        roundRobinGrid.append('<div class="grid-row-name" id="team1Name' + i + '">' + roundRobinArray[i].team1.teamName + '</div>');
                        roundRobinGrid.append('<div class="grid-row-name" id="team2Name' + i + '">' + roundRobinArray[i].team2.teamName + '</div>');
                        roundRobinGrid.append('<div class="grid-row-name" id="field' + i + '">' + roundRobinArray[i].field + '</div>');
                        roundRobinGrid.append('<div class="grid-row-name" id="ref1' + i + '">' + roundRobinArray[i].ref1 + '</div>');
                        roundRobinGrid.append('<div class="grid-row-name" id="ref2' + i + '">' + roundRobinArray[i].ref2 + '</div>');
                    }
                }
                catch(e) {
                    //send alert to user to explain error
                    alert(e);
                }
            });
        }
        catch (e) {
            console.log(e)
        }
    });

    if ($("#completeRoundRobinButton").length > 0) {
        completeRoundRobinBtn.click(function (event) {
            event.preventDefault();

            // console.log(window.location.pathname + '/round_robin_schedule')

            try {
                let req = {
                    method: 'POST',
                    url: baseUrl + '/round_robin_complete',
                    contentType: 'application/json',
                    data: JSON.stringify({

                    })
                };
                $.ajax(req).then(function (res) {
                    if (!res.startsWith("success")) {
                        completeRoundRobinBtn.css({ "color": "red", "border-color": "red" })
                        errorDialog.show()
                        errorDialog.css({ "display": "block" })
                        setTimeout(() => {
                            completeRoundRobinBtn.css({ "color": "black", "border-color": "black" })
                        }, 10000)
                        completeRoundRobinBtn.hide()
                    } else {
                        location.reload();
                    }
                });
            } catch (e) {
                console.log(e);
            }
        });

        $('.errorDialogCancelButton').click((event) => {
            event.preventDefault()
            errorDialog.hide()
            completeRoundRobinBtn.show()
        })
    }

    downloadCSVButton.click(function (event) {

        var table = $(".grid-row-name");
        var header = $(".header");
        let tmpArr = [];
        let rows = [];
        let csvContent = "data:text/csv;charset=utf-8,";

        for (i = 0; i < table.length; i++) {
            if (i % header.length == (header.length - 1)) {
                tmpArr.push(table[i].innerText);
                rows.push(tmpArr);
                tmpArr = [];
            }
            else {
                tmpArr.push(table[i].innerText);
            }
        }
        tmpArr = [];

        rows.forEach(function (rowArray) {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    });

    submitBtn.click(function (event) {
        event.preventDefault();

        let numOfGames = parseInt(totalGames.html());
        let scheduleType = poolSelection.val();
        let matchObj = {};
        let matchArray = [];

        for (i = 0; i < numOfGames; i++) {
            matchObj.gameNum = parseInt($('#gameNum' + i).text());
            matchObj.team1 = $('#team1Name' + i).text();
            matchObj.team2 = $('#team2Name' + i).text();
            matchObj.field = parseInt($('#field' + i).text());
            matchObj.complete = false;
            matchObj.ref1 = $("#ref1" + i).text();
            matchObj.ref2 = $("#ref2" + i).text();

            matchArray.push(matchObj);
            matchObj = {};
        }

        // console.log(window.location.pathname + '/round_robin_schedule')

        try {
            let req = {
                method: 'POST',
                url: baseUrl + '/round_robin_schedule',
                contentType: 'application/json',
                data: JSON.stringify({
                    roundRobinMatches: matchArray,
                    scheduleType: scheduleType,
                })
            };
            $.ajax(req).then(function (res) {
                location.reload();
            });
        }
        catch (e) {
            console.log(e)
        }
    });
})(window.jQuery);