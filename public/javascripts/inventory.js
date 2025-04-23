// Map object to retrieve game map from the definition file, and then, if possible,
// store in the localStorage. When localStorage is not available, the map is stored in a variable,
// so the game can still be played but progress will be lost on browser refresh.
// The map object also provides a convenience method to retrieve data for a specific x,y coordinate
var inventory = {
    
    items: {},

    init: function() {
        items=this.loadItems()
    },

    // load entire original game map into local variable and store in localStorage
    loadItems: function() {
        $.ajax({
            url: "/api/items",
            async: false,
            dataType: 'json',
            success: function( data ) {
                items=JSON.stringify(data);
            }
        });
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")===null) {
            localStorage.setItem("adv-inventory", items);
        }
    },

    // return item data for a single x,y location
    getLocationItems: function(x, y) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        var itemsJson=JSON.parse(items);
        var locationItems=[];
        for (var i=0; i<itemsJson.length; i++) {
            if (!itemsJson[i].isInInventory && itemsJson[i].x==x && itemsJson[i].y==y) {
                locationItems.push(itemsJson[i]);
            }
        }
        return locationItems;
    },

    // return item data for a single x,y location
    getItemDetailsById: function(itemId) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        items=JSON.parse(items);
        for (var i=0; i<items.length; i++) {
            if (items[i].id==itemId) {
                return items[i];
            }
        }
        return {}; // not found
    },

    addItemToInventory: function(itemId) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        var itemsJson=JSON.parse(items);
        for (var i=0; i<itemsJson.length; i++) {
            if (itemsJson[i].id==itemId) {
                itemsJson[i].isInInventory = true;
                break;
            }
        }
        localStorage.setItem("adv-inventory", JSON.stringify(itemsJson));
        return true;
    },

    dropItemFromInventory: function(itemId, xDrop, yDrop) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        var itemsJson=JSON.parse(items);
        for (var i=0; i<itemsJson.length; i++) {
            if (itemsJson[i].id==itemId) {
                itemsJson[i].isInInventory = false;
                itemsJson[i].x=xDrop;
                itemsJson[i].y=yDrop;
                break;
            }
        }
        localStorage.setItem("adv-inventory", JSON.stringify(itemsJson));
        return true;
    },

    // delete item from game instance (generally after it has been used)
    deleteItem: function(itemId) {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        var itemsJson=JSON.parse(items);
        var keepItems=[];
        for (var i=0; i<itemsJson.length; i++) {
            if (itemsJson[i].id!=itemId) {
                keepItems.push(itemsJson[i]);
            }
        }
        localStorage.setItem("adv-inventory", JSON.stringify(keepItems));
        return true;
    },

    getCurrentInventory: function() {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("adv-inventory")!==null) {
            items=localStorage.getItem("adv-inventory");
        }
        var itemsJson=JSON.parse(items);
        var currentInventory=[];
        for (var i=0; i<itemsJson.length; i++) {
            if (itemsJson[i].isInInventory) {
                currentInventory.push(itemsJson[i]);
            }
        }
        return currentInventory;
    }

}