$(document).ready(function() {

    var x=0;
    var y=0;

    var transforms = JSON.parse('{ "north": { "x": 0, "y": -1 }, "east":  { "x": 1, "y": 0 }, "south": { "x": 0, "y": 1 }, "west": { "x": -1, "y": 0 } }');

    function renderLocation(x, y) {
        $("#game #buttons").css("visibility","hidden");
        var location=getMapLocationData(x,y);
        var text='';
        var img='';
        if (typeof location.img != "undefined" && location.img) {
            //html+='<img src="/images/'+x+'-'+y+'.png" class="w-full h-auto mt-0 mb-2 mr-2 ml-0" />';
            img='/images/'+x+'-'+y+'.png';
        }
        text+=location.desc.replace('--','&mdash;');
        $("#buttons .directions button").attr("disabled","disabled");
        
        var dirTexts='';
        Object.keys(location.dirs).forEach(function(dir) {
            var destCoords=transformCoords(x, y, dir);
            var destMeta=getMapLocationData(destCoords.x, destCoords.y);
            if (typeof destMeta.name != "undefined") {
                if (!dirTexts.length) {
                    dirTexts+='To the ';
                } else {
                    dirTexts+=', to the ';
                }
                dirTexts+=dir+' is '+destMeta.name; 
                $("#buttons .directions button[data-dir="+dir+']').removeAttr("disabled");       
            }
        });
        if (dirTexts.length) {
            if (dirTexts.indexOf(', to')!=-1) {
                var pos = dirTexts.lastIndexOf(', to');
                dirTexts = dirTexts.substring(0,pos) + ', and ' + dirTexts.substring(pos+1)
            }
            text+="\n\n"+dirTexts+".";
        }
        text=text.replaceAll("\n","|");
        renderGameText(text, img);
        
    }

    function renderGameText(text, img='') {
        var elId="el-"+Math.floor(Math.random() * 99999999);
        var html='<div class="location mt-2 mb-2 pt-2 pb-2"><p class="m-2" id="'+elId+'">';
        if (img.length) {
            html+='<img src="'+img+'" id="img-'+elId+'" class="w-full pl-22 pr-22 pb-6 pt-4 opacity-100" />';
        }
        html+='</p></div>';
        $("#locations").append(html);
        $("img#img-"+elId).hide().fadeIn(1200, function() {
            $("img#img-"+elId).show();
        });
        scrollGameToBottom(1200);
        setTimeout(function() {
            typeText(elId, text, 0, $("#game").get(0).scrollHeight);
        }, 800);
        
    }

    // output text character-by-character into specified element
    function typeText(elId, text, char, gameHeight) {
        var currGameHeight=$("#game").get(0).scrollHeight;
        if (currGameHeight>gameHeight) {
            scrollGameToBottom();
        }
        if (char<text.length) {
            first_char=text[char].replace("|",'<br>');
            second_char='';
            if (text.length-char>=2) {
                second_char=text[char+1].replace("|",'<br>');
            }
            $("#"+elId).html($("#"+elId).html()+first_char+second_char);
            setTimeout(function() {
                typeText(elId, text, char+2, currGameHeight);
            }, 20);
        } else {
            $("#game #buttons").css("visibility","visible");
            scrollGameToBottom();
        }
    }

    // read in map data for a single x,y location
    function getMapLocationData(x, y) {
        var result={};
        $.ajax({
            url: "/api/map/"+x+"/"+y,
            async: false,
            dataType: 'json',
            success: function( location ) {
                result=location;
            }
        });
        return result;
    }

    // given x,y coords and a direction to move, return the new x,y coords
    function transformCoords(x, y, dir) {
        var thisTransform=transforms[dir];
        x+=thisTransform.x;
        y+=thisTransform.y;
        return {x,y};
    }

    // handle clicks on gameplay buttons
    function initClickHandlers() {
        $("#buttons .directions button").on("click", function() {
            var dir=$(this).attr('data-dir');
            var dest=transformCoords(x, y, dir);
            x=dest.x;
            y=dest.y;
            $("#locations").append('<p class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Go ' + dir + '</p>');
            renderLocation(dest.x, dest.y);
        });
        $("#action").on("change", function() {
            var selected=$(this).val();
            $("#buttons p.directions, #buttons p.items").hide();
            if (selected=="go") {
                $("#buttons p.directions").show();
            } else {
                $("#buttons p.items").show();
            }
        });

    }

    // scroll game window to bottom on resize
    function scrollGameToBottom(speed=250) {
        $("#game").animate({ scrollTop: $('#game').get(0).scrollHeight }, speed);  
    }

    initClickHandlers();
    renderLocation(x,y);

});