let exportedMethods = {

    compareRole: function (handlebarRole, userRole, options) {
        if (handlebarRole == userRole) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    },

    eliminatedTeam: function (eliminatedTeamsArr, userTeam, placement, options) {
        for (i = 0; i < eliminatedTeamsArr.length; i++) {
            if (eliminatedTeamsArr[i].team == userTeam) {
                if (Math.abs(eliminatedTeamsArr[i].currentPlacement) == placement && eliminatedTeamsArr[i].currentPlacement < 0) {
                    return options.fn(this);
                }
            }
        }

        return options.inverse(this);
    },

    incrementIndex: function (index, options) {
        return index + 1;
    },

    idToString: function (id, options) {
        return id.toString();
    },

    checkLoser: function(match, team, options) {
        if(match.loser == team) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    },

    checkTeamName: function(teamName1, teamname2, options) {
        if(teamName1 == "TBD" || teamname2 == "TBD") {
            return options.inverse(this);
        }
        else {
            return options.fn(this);
        }
    }
}

module.exports = exportedMethods;