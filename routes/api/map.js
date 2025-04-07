// endpoint for reading and modifying map data json
var express = require('express');
const fs = require('node:fs');

var router = express.Router();

router.get('/:x?/:y?', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/map.json', 'utf8', (err, data) => {
        if (err) {
            throw new Error(err);
        }

        data=JSON.parse(data); // convert string to JSON object

        // if neither x nor y param passed, return full data set
        if (typeof req.params.x == "undefined" && typeof req.params.y == "undefined") {
            res.json(data);
        }
        
        // if only one of x or y param passed, return nothing
        else if (typeof req.params.x == "undefined" || typeof req.params.y == "undefined") {
            res.json({"status": "not found"});
        }

        //if x and y param passed, return data for only that location, if it exists
        else { 
            for (i=0; i<data.length; i++) {
                if (data[i].x==req.params.x && data[1].y==req.params.y) {
                    res.json(data[i]);
                    return;
                }
            }
            res.json({"status": "not found"}); // x and y location was not found
        }
    });
    
});

module.exports = router;
