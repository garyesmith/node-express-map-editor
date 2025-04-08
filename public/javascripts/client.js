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
        var x=$(this).attr("data-x");
        var y=$(this).attr("data-y");
        $("#location-coords").val(x+","+y);
        $.get("/api/map/"+x+"/"+y, function( location ) {
            $("#location-name").val(location.name)
            $("#location-desc").val(location.desc)
        });
        setFormStatus('');
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
        var id="#map-cell-"+locationCoords[1]+'-'+locationCoords[0];
        $(id).addClass("border-gray-500").addClass("bg-gray-200");
        $(id).text(locationName)
        $.ajax({
            type: "POST",
            url: "/api/map/",
            data: {
                x: locationCoords[0],
                y: locationCoords[1],
                name: locationName,
                desc: locationDesc
            },
            success: function(data) {
                setFormStatus("All changes saved.", true);
            },
            dataType: "json"
          });
    }
});