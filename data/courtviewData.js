const mongoCollections = require("../config/mongoCollections");
const roundrobin = mongoCollections.roundrobin;

let exportedMethods = {

    async getCurrentGameData(fieldNum) {
        const roundrobinCollection = await roundrobin();
        console.log(fieldNum);
        const currentGame = await roundrobinCollection.find({field: fieldNum, complete: false}).sort({gameNum: 1}).limit(1).toArray();

        return currentGame;
    },

}

module.exports = exportedMethods;