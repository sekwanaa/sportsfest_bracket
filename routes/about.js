const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try { 
        res.json({ 
            name: "Bhavin Mistry", 
            cwid: "10384611",
            biography: "My name is Bhavin Mistry. \n A quick fun fact about me is that I enjoy playing sports like Volleyball and Football.\n ",
            favoriteShows: ["Suits", "Stranger Things", "Family Guy", "Regular Show"],
            hobbies: ["Volleyball", "Football", "Video Games"]});
    } catch (e) {
        res.status(404).json({ messages: "About not found"})
    }
});


module.exports = router;