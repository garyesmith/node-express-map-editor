$(document).ready(function() {
  
    var formStatusFadeTimeout;

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
        var x=parseInt($(this).attr("data-x"), 10);
        var y=parseInt($(this).attr("data-y"), 10);
        $(".map-cell").removeClass("bg-sky-300");
        $(this).addClass("bg-sky-300");
        $("#location-coords").val(x+","+y);
        $.get("/api/map/"+x+"/"+y, function( location ) {
            $("#location-name").val(location.name)
            $("#location-desc").val(location.desc)

            // check the correct direction checkboxes based on saved data
            $("input.location-dir").prop('checked', false);
            if (typeof location.dirs != "undefined") {
                if (location.dirs.north) {
                    $("input.location-dir-north").prop('checked', true);
                }
                if (location.dirs.east) {
                    $("input.location-dir-east").prop('checked', true);
                }
                if (location.dirs.south) {
                    $("input.location-dir-south").prop('checked', true);
                }
                if (location.dirs.west) {
                    $("input.location-dir-west").prop('checked', true);
                }
            }
            
        });
        setFormStatus('');

        // enable only direction checkboxes leading to non-empty cells
        $("input.location-dir").attr("disabled", "disabled");
        if ($("#map-cell-"+(y-1)+"-"+x).attr("data-is-empty")=="false") {
            $("input.location-dir-north").removeAttr("disabled");
        }
        if ($("#map-cell-"+(y+1)+"-"+x).attr("data-is-empty")=="false") {
            $("input.location-dir-south").removeAttr("disabled");
        }
        if ($("#map-cell-"+y+"-"+(x+1)).attr("data-is-empty")=="false") {
            $("input.location-dir-east").removeAttr("disabled");
        }
        if ($("#map-cell-"+y+"-"+(x-1)).attr("data-is-empty")=="false") {
            $("input.location-dir-west").removeAttr("disabled");
        }

        $("#location-form").show();
    });

    // handle click on delete location button
    $("#location-form button#delete-location").on("click", function(e) {
        e.preventDefault();
        if (confirm("Are you sure you wish to delete this location?")) {
            $("#location-form input.location-dir").removeAttr("disabled").prop('checked', false); //.trigger("click");
            var locationCoords=$("#location-coords").val().split(",");
            var x=parseInt(locationCoords[0],10);
            var y=parseInt(locationCoords[1],10);
            var id="#map-cell-"+y+'-'+x;;
            $(id).removeClass("bg-sky-300").removeClass("border-gray-500").removeClass("bg-gray-200");
            $(id).addClass("bg-gray-50").addClass("border-gray-200");
            $(id).attr("data-is-empty", true);
            $(id).find("span.cell-name-text").empty();
            $(id).find("div").hide();
            var idToWest="#map-cell-"+y+'-'+(x-1);
            $(idToWest).find("div.path-east").hide();
            var idToSouth="#map-cell-"+(y+1)+'-'+x;
            $(idToSouth).find("div.path-north").hide();
            $("#location-form").show();
            $.ajax({
                type: "DELETE",
                url: "/api/map/"+x+"/"+y,
                contentType: "application/json",
                success: function(data) {
                    console.log("Map cell deleted.");
                },
                dataType: "json"
            });
        }
    });

    // change from status when location form is being edited
    $("#location-form input[type!='checkbox'], #location-form textarea").on("focus", function() {
        setFormStatus("Editing...");
    });

    // save changes when checkbox changes
    $("#location-form input[type='checkbox']").on("change", function() {
        saveForm();
        setTimeout(function() {
            saveForm();
        }, 10);
    })

    // save changes when location form field blurs
    $("#location-form input, #location-form textarea").on("blur", function() {
        saveForm();
    });

    // save changes when save button is clicked
    $("#location-form button#save-location").on("click", function(e) {
        e.preventDefault();
        saveForm();
    });

    function setFormStatus(msg, doFade=false) {
        $("#location-form-status").text(msg).show();
        clearTimeout(formStatusFadeTimeout);
        if (doFade) {
            formStatusFadeTimeout=setTimeout(function() {
                $("#location-form-status").fadeOut(500)
            }, 2500);
        }
    }

    function saveForm() {
        var locationCoords=$("#location-coords").val().split(",");
        var x=parseInt(locationCoords[0],10);
        var y=parseInt(locationCoords[1],10);
        var id="#map-cell-"+y+'-'+x;

        var locationName=$("#location-name").val();
        if (typeof locationName=="undefined" || !locationName.length) {
            locationName='New Location';
            $("#location-name").val(locationName);
        }
        var locationDesc=$("#location-desc").val();
        var locationDirs={
            "north": false,
            "east": false,
            "south": false,
            "west": false
        };
        $(id).find(".path-north, .path-east").hide();
        if ($("input.location-dir-north").prop("checked")) {
            locationDirs.north=true;
            $(id).find(".path-north").show();
        }
        if ($("input.location-dir-east").prop("checked")) {
            locationDirs.east=true;
            $(id).find(".path-east").show();
        }
        if ($("input.location-dir-south").prop("checked")) {
            locationDirs.south=true;
        }
        if ($("input.location-dir-west").prop("checked")) {
            locationDirs.west=true;
        }
        $(id).addClass("border-gray-500").addClass("bg-gray-200");
        $(id).find(".cell-name-text").text(locationName);
        if ($(id).attr("data-is-empty")=="true") {
            $(id).attr("data-is-empty", "false");
            createMapRecord(x, y, locationName, locationDesc, locationDirs);
        } else {
            updateMapRecord(x, y, locationName, locationDesc, locationDirs);
        }

        // redraw paths on cells to immediate west and south
        redrawCellPaths(x-1, y); // west
        redrawCellPaths(x, y+1); // south
    }

    // redraw paths of cell with given coords
    function redrawCellPaths(x, y) {
        $.get("/api/map/"+x+"/"+y, function( location ) {
            if (typeof location != "undefined" && typeof location.dirs != "undefined") {
                var id="#map-cell-"+y+'-'+x;
                $(id).find(".path-north, .path-east").hide();
                if (location.dirs.north) {
                    $(id).find(".path-north").show();
                }
                if (location.dirs.east) {
                    $(id).find(".path-east").show();
                }
            }
        });
    }

    function createMapRecord(x, y, name, desc, dirs) {
        var data={
            x: x,
            y: y,
            name: name,
            desc: desc,
            dirs: dirs
        }
        data=JSON.stringify(data);
        $.ajax({
            type: "POST",
            url: "/api/map/",
            data: data,
            contentType: "application/json",
            success: function(data) {
                setFormStatus("All changes saved.", true);
            },
            dataType: "json"
        });
    }

    function updateMapRecord(x, y, name, desc, dirs) {
        var data={
            x: x,
            y: y,
            name: name,
            desc: desc,
            dirs: dirs
        };
        data=JSON.stringify(data);
        $.ajax({
            type: "PUT",
            url: "/api/map/",
            data: data,
            contentType: "application/json",
            success: function(data) {
                setFormStatus("All changes saved.", true);
            },
            dataType: "json"
        });
    }

});