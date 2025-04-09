// endpoint for reading and modifying map data json
var express = require('express');
const fs = require('node:fs');

var router = express.Router();

// GET endpoint (read all locations, or one location)
router.get('/:x?/:y?', function(req, res, next) {

    // read in the full json data file
    data=fs.readFileSync('public/data/map.json', 'utf8');

    data=JSON.parse(data); // convert string to JSON object

    // if neither x nor y param passed, return full data set
    if (typeof req.params.x == "undefined" && typeof req.params.y == "undefined") {
        res.json(data);
    }
    
    // if only one of x or y param passed, return nothing
    else if (typeof req.params.x == "undefined" || typeof req.params.y == "undefined") {
        res.json({"status": "error", "msg": "Must pass both x and y values to read data for a single location."});
    }

    // if x and y param passed, update data for only that location, if it exists
    else { 
        for (var i=0; i<data.length; i++) {
            if (data[i].x==req.params.x && data[i].y==req.params.y) {
                res.json(data[i]);
                return;
            }
        }
        // if existing x and y location was not found, return error
        res.json({"status": "error", "msg": "No record with specified x and y values was found."}); 
    }
    
});

// POST endpoint (add new location)
router.post('/', function(req, res, next) {

    // read in the full json data file
    data=fs.readFileSync('public/data/map.json', 'utf8');

    data=JSON.parse(data); // convert string to JSON object

    req.body.x=parseInt(req.body.x, 10);
    req.body.y=parseInt(req.body.y, 10);

    for (var i=0; i<data.length; i++) {
        if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y) {
            res.json({"status":"error","msg":"A record with specified x and y values already exists."});
            res.end();
            return;
        }
    }

    data.push(req.body);

    saveMapFile(data, res);

});

// PUT endpoint (update existing location)
router.put('/', function(req, res, next) {

    // read in the full json data file
    data=fs.readFileSync('public/data/map.json', 'utf8');

    data=JSON.parse(data); // convert string to JSON object

    req.body.x=parseInt(req.body.x, 10);
    req.body.y=parseInt(req.body.y, 10);

    var isSaved=false;
    for (var i=0; i<data.length; i++) {
        if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y) {
            data[i]=req.body;
            saveMapFile(data, res);
            isSaved=true;
        }
    }

    if (!isSaved) {
        res.json({"status":"error","msg":"No record with specified x and y values was found."});
    }


});

function saveMapFile(data, res) {
    fs.writeFile('public/data/map.json', JSON.stringify(data, null, 2), err => {
        if (err) {
            console.error(err);
            res.json({"status": "error", "msg":"Could not save JSON: ", "details": err});
            res.end();
        } else {
            res.json({"status": "ok"});
            res.end();
        }
    });
}
        
module.exports = router;
