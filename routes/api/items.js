// endpoint for reading and modifying map data json
var express = require('express');
const fs = require('node:fs');

var router = express.Router();

// GET endpoint (read all items, or one item)
router.get('/:x?/:y?', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/items.json', 'utf8', function(err, data) {

        if (err) {
            console.log("ERROR:");
            console.log(err);
            res.json({"status": "error", "msg": err});
            return;
        }
        data=JSON.parse(data); // convert string to JSON object

        // if neither x nor y param passed, return full data set
        if (typeof req.params.x == "undefined" && typeof req.params.y == "undefined") {
            console.log("Retrieving all items.");
            res.json(data);
            return;
        }
        
        // if only one of x or y param passed, return nothing
        else if (typeof req.params.x == "undefined" || typeof req.params.y == "undefined") {
            res.json({"status": "error", "msg": "Must pass both x and y values to read data for a single item."});
            return;
        }

        // if x and y param passed, retrieve data for only that item, if it exists
        else { 
            console.log("Retrieving records for coords " + req.params.x + " , " + req.params.y);
            for (var i=0; i<data.length; i++) {
                if (data[i].x==req.params.x && data[i].y==req.params.y) {
                    res.json(data[i]);
                    res.end();
                    return;
                }
            }
            // if existing x and y item was not found, return error
            res.json({}); 
            return;
        }
    
    });
    
});

module.exports = router;