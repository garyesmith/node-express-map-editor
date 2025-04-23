// Map object to retrieve game map from the definition file, and then, if possible,
// store in the localStorage. When localStorage is not available, the map is stored in a variable,
// so the game can still be played but progress will be lost on browser refresh.
// The map object also provides a convenience method to retrieve data for a specific x,y coordinate
var map = {
    
    locations: {},

    init: function() {
        locations=this.loadMap()
    },

    // load entire original game map into local variable and store in localStorage
    loadMap: function() {
        $.ajax({
            url: "/api/map",
            async: false,
            dataType: 'json',
            success: function( data ) {
                locations=JSON.stringify(data);
            }
        });
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-locations")===null) {
            localStorage.setItem("adv-locations", locations);
        }
    },

    // return map location data for a single x,y location
    getLocation: function(x, y) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-locations")!==null) {
            locations=localStorage.getItem("adv-locations");
        }
        var locationsJson=JSON.parse(locations);
        for (var i=0; i<locationsJson.length; i++) {
            if (locationsJson[i].x==x && locationsJson[i].y==y) {
                return locationsJson[i];

            }
        }
        return {};
    },

    //replace location data for a single x,y location
    updateLocation: function(updatedLocationRecord) {
        console.log("updating location!");
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-locations")!==null) {
            locations=localStorage.getItem("adv-locations");
        }
        var locationsJson=JSON.parse(locations);
        for (var i=0; i<locationsJson.length; i++) {
            if (locationsJson[i].x==updatedLocationRecord.x && locationsJson[i].y==updatedLocationRecord.y) {
                locationsJson[i]=updatedLocationRecord;
                console.log("match!");
                break;
            }
        }
        localStorage.setItem("adv-locations", JSON.stringify(locationsJson));
        return {"status": "ok"};
    }
}
