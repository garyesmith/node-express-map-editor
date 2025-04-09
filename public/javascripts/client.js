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
        $("#location-coords").val(x+","+y);
        $.get("/api/map/"+x+"/"+y, function( location ) {
            $("#location-name").val(location.name)
            $("#location-desc").val(location.desc)

            // check the correct direction checkboxes based on saved data
            $("input.location-dir").prop('checked', false);
            if (location.dirs.indexOf("north")!=-1) {
                $("input.location-dir-north").prop('checked', true);
            }
            if (location.dirs.indexOf("east")!=-1) {
                $("input.location-dir-east").prop('checked', true);
            }
            if (location.dirs.indexOf("south")!=-1) {
                $("input.location-dir-south").prop('checked', true);
            }
            if (location.dirs.indexOf("west")!=-1) {
                $("input.location-dir-west").prop('checked', true);
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

    // change from status when location form is being edited
    $("#location-form input[type!='checkbox'], #location-form textarea").on("focus", function() {
        setFormStatus("Editing...");
    });

    // save changes when checkbox changes field blurs
    $("#location-form input[type='checkbox']").on("change", function() {
        saveForm();
    })

    // save changes when location form field blurs
    $("#location-form input, #location-form textarea").on("blur", function() {
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
        var locationName=$("#location-name").val();
        var locationDesc=$("#location-desc").val();
        var locationDirs=[];
        if ($("input.location-dir-north").prop("checked")) {
            locationDirs.push("north");
        }
        if ($("input.location-dir-east").prop("checked")) {
            locationDirs.push("east");
        }
        if ($("input.location-dir-south").prop("checked")) {
            locationDirs.push("south");
        }
        if ($("input.location-dir-west").prop("checked")) {
            locationDirs.push("west");
        }
        locationDirs=locationDirs.join(",");
        if (typeof locationDirs=="undefined" || !locationDirs.length) {
            locationDirs='';
        }
        var id="#map-cell-"+locationCoords[1]+'-'+locationCoords[0];
        $(id).addClass("border-gray-500").addClass("bg-gray-200");
        $(id).text(locationName);
        if ($(id).attr("data-is-empty")=="true") {
            $(id).attr("data-is-empty", "false");
            createMapRecord(locationCoords[0], locationCoords[1], locationName, locationDesc, locationDirs);
        } else {
            updateMapRecord(locationCoords[0], locationCoords[1], locationName, locationDesc, locationDirs);
        }
    }

    function createMapRecord(x, y, name, desc, dirs="") {
        $.ajax({
            type: "POST",
            url: "/api/map/",
            data: {
                x: x,
                y: y,
                name: name,
                desc: desc,
                dirs: dirs
            },
            success: function(data) {
                setFormStatus("All changes saved.", true);
            },
            dataType: "json"
        });
    }

    function updateMapRecord(x, y, name, desc, dirs="") {
        $.ajax({
            type: "PUT",
            url: "/api/map/",
            data: {
                x: x,
                y: y,
                name: name,
                desc: desc,
                dirs: dirs
            },
            success: function(data) {
                setFormStatus("All changes saved.", true);
            },
            dataType: "json"
        });
    }

});