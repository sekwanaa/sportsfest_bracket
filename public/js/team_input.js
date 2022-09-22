(function ($) {
    var addMoreButton = $('#add_more_button')
    var removeMember = $('#remove_button')
    var i = 2
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
})(window.jQuery);