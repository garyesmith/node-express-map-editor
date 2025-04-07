$(document).ready(function() {
  
    // adjust size of map container based on number of cells
    var mapWidth=$("#map").attr("data-mapWidthPx");
    var mapHeight=$("#map").attr("data-mapHeightPx");
    $("#map").width(mapWidth+"px").height(mapHeight+"px");

    // center overflow map
    var mapWidth=$('#map').width();
    var mapViewWidth=$('#map-container').width();
    var mapHeight=$('#map').height();
    var mapViewHeight=$('#map-container').height();
    $('#map-container').scrollLeft(mapWidth/2-mapViewWidth/2);
    $('#map-container').scrollTop(mapHeight/2-mapViewHeight/2);

    // handle clicks on map cell
    $(".map-cell").on("click", function() {
        var x=$(this).attr("data-x");
        var y=$(this).attr("data-y");
        $("#location-coords").val(x+","+y);
        $("#location-name").val(map[y][x].name)
    });

});