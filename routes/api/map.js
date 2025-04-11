// endpoint for reading and modifying map data json
var express = require('express');
const fs = require('node:fs');

var router = express.Router();

// GET endpoint (read all locations, or one location)
router.get('/:x?/:y?', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/map.json', 'utf8', function(err, data) {

        if (err) {
            console.log("ERROR:");
            console.log(err);
            res.json({"status": "error", "msg": err});
            return;
        }
        data=JSON.parse(data); // convert string to JSON object

        // if neither x nor y param passed, return full data set
        if (typeof req.params.x == "undefined" && typeof req.params.y == "undefined") {
            console.log("Retrieving all map data.");
            res.json(data);
            return;
        }
        
        // if only one of x or y param passed, return nothing
        else if (typeof req.params.x == "undefined" || typeof req.params.y == "undefined") {
            res.json({"status": "error", "msg": "Must pass both x and y values to read data for a single location."});
            return;
        }

        // if x and y param passed, retrieve data for only that location, if it exists
        else { 
            console.log("Retrieving records for coords " + req.params.x + " , " + req.params.y);
            for (var i=0; i<data.length; i++) {
                if (data[i].x==req.params.x && data[i].y==req.params.y) {
                    res.json(data[i]);
                    res.end();
                    return;
                }
            }
            // if existing x and y location was not found, return error
            res.json({"status": "error", "msg": "No record with specified x and y values was found."}); 
            return;
        }
    
    });
    
});

// POST endpoint (add new location)
router.post('/', function(req, res, next) {

    // read in the full json data file
    data=fs.readFileSync('public/data/map.json', 'utf8');

    data=JSON.parse(data); // convert string to JSON object

    req.body.x=parseInt(req.body.x, 10);
    req.body.y=parseInt(req.body.y, 10);

    if (typeof req.body.name == "undefined" || !req.body.name.length) {
        req.body.name='New Location';
    }

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

    var recordUpdated=false;
    for (var i=0; i<data.length; i++) {
        if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y) {
            data[i]=req.body;
            recordUpdated=true;
        }
        // also change the opposite end of any path direction to make sure it matches
        // ex. every east connection must have a corresponding west direction in the neighbouring cell, etc.
        // these changes to neighbouring cells will only be saved if the requested cell is changed
        if (parseInt(data[i].x,10)==req.body.x-1 && parseInt(data[i].y,10)==req.body.y) {
            data[i].dirs.east=req.body.dirs.west;
        }
        if (parseInt(data[i].x,10)==req.body.x+1 && parseInt(data[i].y,10)==req.body.y) {
            data[i].dirs.west=req.body.dirs.east;
        }
        if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y-1) {
            data[i].dirs.south=req.body.dirs.north;
        }
        if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y+1) {
            data[i].dirs.north=req.body.dirs.south;
        }
    }

    if (recordUpdated) {
        saveMapFile(data, res);
    } else {
        res.json({"status":"error","msg":"No record with specified x and y values was found."});
    }


});

// DELETE endpoint
router.delete('/:x?/:y?', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/map.json', 'utf8', function(err, data) {

        if (err) {
            console.log("ERROR:");
            console.log(err);
            res.json({"status": "error", "msg": err});
            return;
        }
        data=JSON.parse(data); // convert string to JSON object

        // if neither x nor y param passed, return full data set
        if (typeof req.params.x == "undefined" && typeof req.params.y == "undefined") {
            console.log("Retrieving all map data.");
            res.json(data);
            return;
        }
        
        // if only one of x or y param passed, return nothing
        else if (typeof req.params.x == "undefined" || typeof req.params.y == "undefined") {
            res.json({"status": "error", "msg": "Must pass both x and y values to read data for a single location."});
            return;
        }

        // if x and y param passed, retrieve data for only that location, if it exists
        else { 
            // loop to eliminate any path connections to the cell being deleted from its neighbours
            for (var i=0; i<data.length; i++) {
                if (parseInt(data[i].x,10)==req.params.x-1 && parseInt(data[i].y,10)==req.params.y) {
                    data[i].dirs.east=false;
                    continue;
                }
                if (parseInt(data[i].x,10)==req.params.x+1 && parseInt(data[i].y,10)==req.params.y) {
                    data[i].dirs.west=false;
                    continue;
                }
                if (parseInt(data[i].x,10)==req.params.x && parseInt(data[i].y,10)==req.params.y-1) {
                    data[i].dirs.south=false;
                    continue;
                }
                if (parseInt(data[i].x,10)==req.params.x && parseInt(data[i].y,10)==req.params.y+1) {
                    data[i].dirs.north=false;
                    continue;
                }
            }
            // loop again and remove the cell from the map data array
            for (var i=0; i<data.length; i++) {
                if (data[i].x==req.params.x && data[i].y==req.params.y) {
                    console.log("Deleting array element with index " + i);
                    data.splice(i, 1);
                    break;
                }
            }
            saveMapFile(data, res);
        }
    });

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
