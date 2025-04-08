// endpoint for reading and modifying map data json
var express = require('express');
const fs = require('node:fs');

var router = express.Router();

// GET endpoint (read all locations, or one location)
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
            for (var i=0; i<data.length; i++) {
                if (data[i].x==req.params.x && data[i].y==req.params.y) {
                    res.json(data[i]);
                    return;
                }
            }
            res.json({"status": "not found"}); // x and y location was not found
        }
    });
    
});

// POST endpoint (add new location)
router.post('/', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/map.json', 'utf8', (err, data) => {
        if (err) {
            throw new Error(err);
        }

        data=JSON.parse(data); // convert string to JSON object

        req.body.x=parseInt(req.body.x, 10);
        req.body.y=parseInt(req.body.y, 10);

        for (var i=0; i<data.length; i++) {
            if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y) {
                res.json({"status":"error","message":"A record with these x and y values already exists."});
                return;
            }
        }

        data.push(req.body);

        saveMapFile(data);

    });

});

// PUT endpoint (update existing location)
router.put('/', function(req, res, next) {

    // read in the full json data file
    fs.readFile('public/data/map.json', 'utf8', (err, data) => {
        if (err) {
            throw new Error(err);
        }

        data=JSON.parse(data); // convert string to JSON object

        req.body.x=parseInt(req.body.x, 10);
        req.body.y=parseInt(req.body.y, 10);

        for (var i=0; i<data.length; i++) {
            if (parseInt(data[i].x,10)==req.body.x && parseInt(data[i].y,10)==req.body.y) {
                data[i]=req.body;
                saveMapFile(data);
                break;
            }
        }

        res.json({"status":"ok"});

    });

});

function saveMapFile(data) {
    fs.writeFile('public/data/map.json', JSON.stringify(data, null, 2), err => {
        if (err) {
            console.error(err);
        } else {
            res.json({"status": "ok"});
            return;
        }
    });
}
        
module.exports = router;
