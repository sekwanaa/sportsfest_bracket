(function ($) {
    const hamburgerMenuBtn = $("#hamburger-menu");
    const navLinks = $("#nav_links");

    hamburgerMenuBtn.click(function (event) {
        event.preventDefault()

        navLinks.toggleClass("active")
    });

})(window.jQuery);