const mongoCollections = require("../config/mongoCollections");
const roundrobin = mongoCollections.roundrobin;
const playoffs = mongoCollections.playoffs;
const semis = mongoCollections.semis;
const finals = mongoCollections.finals;

let exportedMethods = {

    async getCurrentGameData(fieldNum) {
        const roundrobinCollection = await roundrobin();
        // fieldNum = fieldNum.toString();
        let currentGame = await roundrobinCollection.find({field: fieldNum, complete: false}).sort({gameNum: 1}).limit(1).toArray();

        if(currentGame.length < 1) {
            const playOffCollection = await playoffs();
            currentGame = await playOffCollection.find({field: fieldNum, complete: false}).sort({gameNum: 1}).limit(1).toArray();
            console.log(currentGame);
        }

        if(currentGame.length < 1) {
            const semisCollection = await semis();
            currentGame = await semisCollection.find({field: fieldNum, complete: false}).toArray();
        }
        if(currentGame.length < 1) {
            const finalsCollection = await finals();
            currentGame = await finalsCollection.find({field: fieldNum, complete: false}).toArray();
        }

        return currentGame;
    },

}

module.exports = exportedMethods;