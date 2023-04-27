const mongoCollections = require("../config/mongoCollections");
const roundrobin = mongoCollections.roundrobin;
const playoffs = mongoCollections.playoffs;

let exportedMethods = {

    async getCurrentGameData(fieldNum) {
        const roundrobinCollection = await roundrobin();

        let currentGame = await roundrobinCollection.findOne({field: fieldNum, complete: false});

        if(currentGame == null) {
            const playOffCollection = await playoffs();
            currentGame = await playOffCollection.find({field: fieldNum, complete: false}).sort({gameNum: 1}).limit(1).toArray();
        }

        return currentGame;
    },

}

module.exports = exportedMethods;