(function ($) {
    let mainNav = $(".main-nav");
    let listItemCount = mainNav.children().length
    if (listItemCount == 1) {
        mainNav.toggleClass("login")
    }

    const hamburgerMenuBtn = $("#hamburger-menu");
    const navLinks = $("#nav_links");

    hamburgerMenuBtn.click(function (event) {
        event.preventDefault()

        navLinks.toggleClass("active")
    });

})(window.jQuery);