(function ($) {
    var addMoreButton = $('#add_more_button')
    var removeMember = $('#remove_button')
    var teamInputForm = $('#teamInputForm')
    var i = 2
    removeMember.hide()
    addMoreButton.click(function () {
        removeMember.show()
        const div = $("#teamMembers");
        div.append('<input id="teamMemberName' + i++ +'" type="text" placeholder="Team Member Name"></input>');
    });

    removeMember.click(function () {
        if (i==3) {
            $(this).hide()
        }
        i -= 1
        console.log(i)
        const input = $("#teamMemberName" + i);
        input.remove();
    });

    teamInputForm.submit(function (event) {
        event.preventDefault();
        var one = $('#teamName').val();
        var two = $('#teamMemberName').val();

        //try{
            let req = {
                method: 'POST',
                url: '/team_input/submitTeams',
                contentType: 'application/json',
                data: JSON.stringify({
                    teamName: one,
                    district: 1,
                    players: [two],
                })
            };
            $.ajax(req).then(function (res) {
                console.log("Ye Boi")
            });
        //} 
       // catch (e) {
            //console.log(e)
       // }
    })
})(window.jQuery);