var express = require('express');
var router = express.Router();
const fs = require('node:fs');

// configuration -- change these values as required
const mapNumVerticalCells=25;
const mapNumHorizontalCells=25;

// load the full map data from json and convert it to an array
function loadMapData() {
        
    // define an empty map array
    let map=[];
    for (y=-Math.floor(mapNumVerticalCells/2); y<Math.ceil(mapNumVerticalCells/2); y++) {
        let row=[];
        for (x=-Math.floor(mapNumHorizontalCells/2); x<Math.ceil(mapNumHorizontalCells/2); x++) {
            row[x]={
                x: x,
                y: y,
                name: '',
                isEmpty: true,
                dirs: {
                    "north": false,
                    "east": false,
                    "south": false,
                    "west": false
                }
            }
        }
        map[y]=row;
    }

    // read in map json and add any defined locations to the map array
    var locations=fs.readFileSync('public/data/map.json', 'utf8');

    locations=JSON.parse(locations); // convert string to JSON object

    // loop through all defined locations, if it matches on x and y, replace the array element
    for (var i=0; i<locations.length; i++) {
        locations[i].isEmpty=false;
        map[locations[i].y][locations[i].x]=locations[i];
    }

    return map;

}

// pass dynamic values to the edit template
router.get('/', function(req, res, next) {
    let map=loadMapData();
    res.render('edit', {
        title: 'Map Editor',
        year: new Date().getFullYear(),
        map: map,
        mapNumVerticalCells: mapNumVerticalCells,
        mapNumHorizontalCells: mapNumHorizontalCells,
        mapHeightPx: mapNumVerticalCells*116,
        mapWidthPx: mapNumHorizontalCells*177
    })
});

module.exports = router;
