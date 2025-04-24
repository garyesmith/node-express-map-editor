
var hooks = {
    
    "runHook": function(functionName){
        if (typeof this[functionName] == "function") {
            return this[functionName]();
        } else {
            console.log("Could not execute hook function with name '" + functionName + "'");
            game.renderGameText("Something went wrong.");
            return '';
        }
    },

    "hook_wooden_plank": function() {
        var location=map.getLocation(2, -2);
        location.dirs.east=true;
        location.desc="You are at the edge of a riverbank. A makeshift bridge across the rapidly flowing water has recently been repaired.";
        map.updateLocation(location);
        var location=map.getLocation(3, -2);
        location.dirs.west=true;
        map.updateLocation(location);
        game.renderLocation(2, -2);
        game.scrollGameToBottom();
    },

    "hook_hatchet": function() {
        var item=inventory.getItemDetailsById('hatchet');
        item.use=false;
        inventory.updateItemRecord(item);
        var item=inventory.getItemDetailsById('trap_door');
        item.examine="A small wooden trap door that has been propped open, revealing a ladder heading down into darkness.";
        item.use={
            "x": 4,
            "y": -4,
            "result": "You climb down the ladder through the trap door.",
            "hook": "hook_trap_door",
            "deleteAfter": false
        };
        inventory.updateItemRecord(item);
        game.resetCurrentLocationItemButtons();
    },

    "hook_trap_door": function() {
        game.x=0;
        game.y=0;
        game.renderLocation(0, 0);
        game.scrollGameToBottom();
    }


}