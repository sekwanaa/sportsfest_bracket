const mongoCollections = require("../config/mongoCollections");
const roundrobin = mongoCollections.roundrobin;
const playoffs = mongoCollections.playoffs;

let exportedMethods = {

    async getCurrentGameData(idArray, fieldNum) {
        const roundrobinCollection = await roundrobin();

        // let currentGame = await roundrobinCollection.findOne({field: fieldNum, complete: false});
        let currentGame = null;

        //Need to find the next uncompleted game from round robin for the tournament

        //find and sort all incomplete games for current field number
        let games = await roundrobinCollection.find({field: fieldNum, complete:false}).sort({gameNum: 1}).toArray();

        //check in ascending order if games found exists in roundRobinArray using ID
        for(let i=0; i<games.length; i++) {
            if(idArray.includes(games[i]._id.toString())) {
                currentGame = games[i];
                break;
            }
        }

        if(currentGame == null) {
            games = await roundrobinCollection.find({field: fieldNum, complete:false}).sort({gameNum: 1}).toArray();

            for(let i=0; i<games.length; i++) {
                if(idArray.includes(games[i]._id.toString())) {
                    currentGame = games[i];
                    break;
                }
            }
            const playOffCollection = await playoffs();
            currentGame = await playOffCollection.find({field: fieldNum, complete: false}).sort({gameNum: 1}).limit(1).toArray();
        }

        return currentGame;
    },

}

module.exports = exportedMethods;