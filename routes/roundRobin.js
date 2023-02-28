const express = require("express");
const router = express.Router();
const data = require('../data')
const poolsData = data.poolsData;

router.post("/", async (req, res) => {
    const roundRobin = await poolsData.roundRobinSelection();

    return res.json(roundRobin);
});

module.exports = router;