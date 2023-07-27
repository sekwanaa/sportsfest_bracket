(function ($) {
    var baseUrl = window.location.pathname;
    let errorDialog = $('.errorDialog')
    let downloadCSVButton = $('#downloadCSVButton_seedingTable')

    $("#sportsActiveDropdownMenu").toggleClass("hidden sportsActive")

    var submitSeedsBtn = null;

    if ($("#seed_submit_button").length > 0) {
        submitSeedsBtn = $("#seed_submit_button");
    }

    var refreshSeedTableBtn = $("#refresh_seed_table_button");
    var seedInfo = $("#seed_info_div");

    refreshSeedTableBtn.click(function (event) {
        try {
            let req = {
                method: 'POST',
                url: baseUrl + '/seeds',
                contentType: 'application/json',
                data: JSON.stringify({

                })
            };
            $.ajax(req).then(function (matchHistory) {
                let objCount = 1;

                var seedNum = $("#seed" + objCount);
                let seedNumLength = seedNum.length;
                var teamName = $("#teamName" + objCount);
                var wins = $("#wins" + objCount);
                var losses = $("#losses" + objCount);
                var pointDiff = $("#pointDiff" + objCount);

                while (seedNumLength > 0) {
                    seedNum.remove();
                    teamName.remove();
                    wins.remove();
                    losses.remove();
                    pointDiff.remove();

                    objCount++;

                    seedNum = $("#seed" + objCount);
                    teamName = $("#teamName" + objCount);
                    wins = $("#wins" + objCount);
                    losses = $("#losses" + objCount);
                    pointDiff = $("#pointDiff" + objCount);

                    seedNumLength = seedNum.length;

                }

                let idCount = 1;
                for (i = 0; i < matchHistory.length; i++) {
                    seedInfo.append('<p id="seed' + idCount + '">' + idCount + '</p>')
                    seedInfo.append('<p id="teamName' + idCount + '">' + matchHistory[i].name + '</p>');
                    seedInfo.append('<p id="wins' + idCount + '">' + matchHistory[i].winnerCount + '</p>');
                    seedInfo.append('<p id="losses' + idCount + '">' + matchHistory[i].loserCount + '</p>');
                    seedInfo.append('<p id="pointDiff' + idCount + '">' + matchHistory[i].pointDifferential + '</p>');
                    idCount++;
                }
            });
        }
        catch (e) {
            console.log(e)
        }
    });

    if ($("#seed_submit_button").length > 0) {
        submitSeedsBtn.click(async function (event) {
            event.preventDefault();

            let seedCount = 1;

            var seed = $("#seed" + seedCount);
            var teamName = $("#teamName" + seedCount);
            var wins = $("#wins" + seedCount);
            var losses = $("#losses" + seedCount);
            var pointDiff = $("#pointDiff" + seedCount);

            let seedsArray = [];
            let seedObj = {};

            while (teamName.length != 0) {
                seedObj = {
                    team: teamName.html(),
                    wins: parseInt(wins.html()),
                    losses: parseInt(losses.html()),
                    pointDiff: parseInt(pointDiff.html()),
                    seed: parseInt(seed.html()),
                    currentPlacement: null,
                }

                seedsArray.push(seedObj);
                seedObj = {};
                seedCount++;
                seed = $("#seed" + seedCount);
                teamName = $("#teamName" + seedCount);
                wins = $("#wins" + seedCount);
                losses = $("#losses" + seedCount);
                pointDiff = $("#pointDiff" + seedCount);
            }

            seedCount = 0;

            try {
                let req = {
                    method: 'POST',
                    url: baseUrl + '/insertSeeds',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        seedsArray: seedsArray,
                    })
                };
                $.ajax(req).then(function (res) {
                    if (!res.startsWith("success")) {
                        submitSeedsBtn.css({ "color": "red", "border-color": "red" })
                        errorDialog.show()
                        errorDialog.css({ "display": "block" })
                        setTimeout(() => {
                            submitSeedsBtn.css({ "color": "black", "border-color": "black" })
                        }, 10000)
                        submitSeedsBtn.hide()
                    } else {
                        location.reload();
                    }
                });
            }
            catch (e) {
                console.log(e)
            }
        });
    }

    $('.errorDialogCancelButton').click((event) => {
        event.preventDefault()
        errorDialog.hide()
        submitSeedsBtn.show()
    })

    downloadCSVButton.click((event) => {
        event.preventDefault()

        const header = $('.header_bar')
        let table = $('.seed_info')
        let tempArr = []
        let headers = []
        let rows = []
        let csvContent = "data:text/csv;charset=utf-8,"

        for (let i = 0; i < header[0].children.length; i++) {
            if (header[0].children[i].innerHTML.startsWith("Team Name")) {
                headers.push(header[0].children[i].innerHTML)
            }
            if (header[0].children[i].innerHTML.startsWith("Seed #")) {
                headers.push("Districts")
                headers.push("Power Ranking")
            }
        }

        try {
            let req = {
                method: 'POST',
                url: baseUrl + '/getDistricts',
                contentType: 'application/json',
                data: JSON.stringify({
                })
            };
            $.ajax(req).then(function (res) {
                // location.reload();
                for (let i = 0; i < table.length; i++) {
                    for (let j = 0; j < table.length; j++) {
                        if (res[j].teamName == $('#teamName' + i)[0].innerHTML) {
                            tempArr.push(res[j].teamName, res[j].district, parseInt($('#seed' + i)[0].innerHTML))
                            rows.push(tempArr)
                            tempArr = []
                        }
                    }
                }

                rows.forEach(team => {
                    let row = team.join(",")
                    csvContent += row + "\r\n"
                })

                var encodedUri = encodeURI(csvContent);
                window.open(encodedUri);
            });
        }
        catch (e) {
            console.log(e)
        }
    })

})(window.jQuery);