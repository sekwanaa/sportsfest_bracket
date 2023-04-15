let exportedMethods= {

    compareRole : function(handlebarRole, userRole, options) {
        if(handlebarRole == userRole) {
            return options.fn(this);
        }
        else { 
            return options.inverse(this);
        }
    },
    
    eliminatedTeam: function(eliminatedTeamsArr, userTeam, options) {
        if (eliminatedTeamsArr.includes(userTeam)) {
            return options.fn(this);
        }
        
        return options.inverse(this);
    },

}

module.exports = exportedMethods;