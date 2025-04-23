
var hooks = {
    
    "runHook": function(functionName){
        return this[functionName]()
    },

    "hook_wooden_plank": function() {
        var location=map.getLocation(3, -2);
        location.dirs.east=true;
        location.desc="You are at the edge of a riverbank. A makeshift bridge across the rapidly flowing water has recently been repaired.";
        map.updateLocation(location);
        var location=map.getLocation(4, -2);
        location.dirs.west=true;
        map.updateLocation(location);
        game.renderLocation(3, -2);
        game.scrollGameToBottom();
    }

}