var express = require('express');
var router = express.Router();

const mapNumVerticalCells=25;
const mapNumHorizontalCells=25;

// define empty map grid
let map=[];
for (y=-Math.floor(mapNumVerticalCells/2); y<Math.ceil(mapNumVerticalCells/2); y++) {
    let row=[];
    for (x=-Math.floor(mapNumHorizontalCells/2); x<Math.ceil(mapNumHorizontalCells/2); x++) {
        row[x]={
            x: x,
            y: y,
            name: '',
            isEmpty: true
        }
    }
    map[y]=row;
}

map[0][0].isEmpty=false;
map[0][0].name='An empty field.';

map[0][1].isEmpty=false;
map[0][1].name='A rocky ledge.';

router.get('/', function(req, res, next) {
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
