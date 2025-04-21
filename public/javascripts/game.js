var game = {
    
    x: 0,
    y: 0,
    transforms: JSON.parse('{ "north": { "x": 0, "y": -1 }, "east":  { "x": 1, "y": 0 }, "south": { "x": 0, "y": 1 }, "west": { "x": -1, "y": 0 } }'),

    // initialize the game
    init: function() {
        x=this.x,
        y=this.y;
        map.init();
        inventory.init();
        this.renderLocation(x,y);
    },

    // build the full text to output for a requested x,y location
    renderLocation: function(x, y) {
        $("#game #buttons").css("visibility","hidden");
        var location=map.getLocation(x,y);
        var text='';
        var img='';

        // temporarily disable all interaction buttons
        $("#buttons button").attr("disabled","disabled");

        // build the URL for any optional image associated with the location
        if (typeof location.img != "undefined" && location.img) {
            img='/images/'+x+'-'+y+'.png';
        }

        // format the location description
        text+=location.desc.replace('--','&mdash;');
        
        // append a description of accessible directions to the location text
        var dirTexts='';
        var thisContext=this;
        Object.keys(location.dirs).forEach(function(dir) {
            var destCoords=thisContext.transformCoords(x, y, dir);
            var destMeta=map.getLocation(destCoords.x, destCoords.y);
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

        // append any items at the this location to the location text
        items=inventory.getLocationItems(x,y);
        if (items.length) {
           // $("#buttons p.examine, #buttons p.get").empty().hide();
            for (var i=0; i<items.length; i++) {
                if (!items[i].isInInventory) {
                    text+="\n\nThere is a " + items[i].name + " here.";
                    //$("#buttons button.examine").removeAttr("disabled");
                   // $("#buttons p.examine").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" data-item-examine="'+items[i].examine +'" class="examine-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">EXAMINE '+ items[i].name.toUpperCase()+'</button>');
                    //if (items[i].isGettable) {
                   //     $("#buttons button.get").removeAttr("disabled");
                   //    $("#buttons p.get").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" class="get-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">GET '+ items[i].name.toUpperCase()+'</button>');
                   // }
                } 
                //else {
                    //$("#buttons button.drop-item").removeAttr("disabled");
               // }
            }
        }

        // append any items in the current inventory (carrying) to the drop and use buttons
        //var currentInventory=inventory.getCurrentInventory();
        //$("#buttons p.drop, #buttons p.use").empty().hide();
        //if (typeof currentInventory != "undefined" && currentInventory.length) {
        //    for (var i=0; i<currentInventory.length; i++) {
        //        $("#buttons button.drop, #buttons button.use").removeAttr("disabled");
        //        $("#buttons p.drop").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="drop-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">Drop '+ currentInventory[i].name.toUpperCase()+'</button>');
        //        $("#buttons p.use").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="use-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">Use '+ currentInventory[i].name.toUpperCase()+'</button>');
        //    }
        //}

       // $("#buttons p.examine, #buttons p.get, #buttons p.drop, #buttons p.use").append('<button data-action="cancel" class="item-cancel bg-slate-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-slate-800 disabled:hover:bg-slate-500 disabled:opacity-30">CANCEL</button>');

        // reset location buttons related to items
        this.resetCurrentLocationItemButtons();

        // format line breaks in the location text
        text=text.replaceAll("\n","|");

        // output the full location description, directions and items to the game screen
        this.renderGameText(text, img);

    },

    // wrap location text in the required HTML, and trigger related typing and scrolling animations
    renderGameText: function(text, img='', callback) {
        var elId="el-"+Math.floor(Math.random() * 99999999);
        var html='<div class="location mt-2 mb-2 pt-2 pb-2"><p class="m-2" id="'+elId+'">';
        if (img.length) {
            html+='<img src="'+img+'" id="img-'+elId+'" class="w-full pl-11 pr-11 pb-8 pt-0 opacity-100" />';
        }
        html+='</p></div>';
        $("#locations").append(html);
        $("img#img-"+elId).hide().fadeIn(1200, function() {
            $("img#img-"+elId).show();
        });
        this.scrollGameToBottom(1200);
        var thisContext=this;
        setTimeout(function() {
            thisContext.typeText(elId, text, 0, $("#game").get(0).scrollHeight, callback);
        }, 400);
        
    },

    // output text character-by-character into specified element
    typeText: function(elId, text, char, gameHeight, callback) {
        var currGameHeight=$("#game").get(0).scrollHeight;
        if (currGameHeight>gameHeight) {
            this.scrollGameToBottom();
        }
        if (char<text.length) {
            first_char=text[char].replace("|",'<br>');
            second_char='';
            if (text.length-char>=2) {
                second_char=text[char+1].replace("|",'<br>');
            }
            $("#"+elId).html($("#"+elId).html()+first_char+second_char);
            var thisContext=this;
            setTimeout(function() {
                thisContext.typeText(elId, text, char+2, currGameHeight, callback);
            }, 20);
        } else {
            $("#game #buttons").css("visibility","visible");
            this.scrollGameToBottom();
            if (typeof callback == "function") {
                setTimeout(function() {
                    callback();
                }, 600);
            }
        }
    },

    // given x,y coords and a direction to move, return the new x,y coords
    transformCoords: function(x, y, dir) {
        var thisTransform=this.transforms[dir];
        x+=thisTransform.x;
        y+=thisTransform.y;
        return {x,y};
    },

    // handle clicks on gameplay buttons
    initClickHandlers: function() {
        var thisContext=this;
        $("#buttons p.directions button").off("click").on("click", function() {
            var dir=$(this).attr('data-dir');
            var dest=thisContext.transformCoords(x, y, dir);
            x=dest.x;
            y=dest.y;
            $("#locations").append('<p class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Go ' + dir + '</p>');
            thisContext.renderLocation(dest.x, dest.y);
        });
        $("#buttons button.examine").off("click").on("click", function() {
            $("#buttons p.examine").show();
            $("#buttons p.directions, #buttons p.items").hide();
        });
        $("#buttons button.get").off("click").on("click", function() {
            $("#buttons p.get").show();
            $("#buttons p.directions, #buttons p.items").hide();
        });
        $("#buttons button.drop").off("click").on("click", function() {
            $("#buttons p.drop").show();
            $("#buttons p.directions, #buttons p.items").hide();
        });
        $("#buttons button.use").off("click").on("click", function() {
            $("#buttons p.use").show();
            $("#buttons p.directions, #buttons p.items").hide();
        });
        $("#buttons button.item-cancel").off("click").on("click", function() {
            $("#buttons p.examine, #buttons p.get, #buttons p.drop, #buttons p.use").hide();
            $("#buttons p.directions, #buttons p.items").show();
        });
        $("#buttons button.examine-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#locations").append('<p class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Examine ' + $(this).attr("data-item-name") + '</p>');
            thisContext.renderGameText($(this).attr("data-item-examine"), '', function() {
                $("#buttons, #buttons p.directions, #buttons p.items").show();
                thisContext.scrollGameToBottom();
            });
        });
        $("#buttons button.get-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#locations").append('<p class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Get ' + $(this).attr("data-item-name") + '</p>');
            inventory.addItemToInventory($(this).attr("data-item-id"));
            thisContext.renderGameText("You pick up the " + $(this).attr("data-item-name") +'.', '', function() {
                thisContext.resetCurrentLocationItemButtons();
                thisContext.scrollGameToBottom();
            });
        });
        $("#buttons button.drop-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#locations").append('<p class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Drop ' + $(this).attr("data-item-name") + '</p>');
            inventory.dropItemFromInventory($(this).attr("data-item-id"), x, y);
            thisContext.renderGameText("You drop the " + $(this).attr("data-item-name") +'.', '', function() {
                thisContext.resetCurrentLocationItemButtons();
                thisContext.scrollGameToBottom();
            });
        });

        $("#action").off("change").on("change", function() {
            var selected=$(this).val();
            $("#buttons p.directions, #buttons p.items").hide();
            if (selected=="go") {
                $("#buttons p.directions").show();
            } else {
                $("#buttons p.items").show();
            }
        });

    },

    // reset visibility and disabled status for buttons related to items at the current location
    resetCurrentLocationItemButtons: function() {

        // reset button containers to default
        $("#buttons, #buttons p.directions, #buttons p.items").show();
        $("#buttons p.examine, #buttons p.get, #buttons p.drop, #buttons p.use").hide();
        $("#buttons p.items button").attr("disabled","disabled");

        // update buttons related to items at current location
        var items=inventory.getLocationItems(x,y);
        if (items.length) {
            console.log("there is at least one item here");
            console.log(items);
            $("#buttons p.items button.examine, #buttons p.items button.get").removeAttr("disabled");
            $("#buttons p.examine, #buttons p.get").empty().hide();
            for (var i=0; i<items.length; i++) {
                if (!items[i].isInInventory) {
                    $("#buttons button.examine").removeAttr("disabled");
                    $("#buttons p.examine").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" data-item-examine="'+items[i].examine +'" class="examine-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">EXAMINE '+ items[i].name.toUpperCase()+'</button>');
                    if (items[i].isGettable) {
                        $("#buttons button.get").removeAttr("disabled");
                        $("#buttons p.get").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" class="get-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">GET '+ items[i].name.toUpperCase()+'</button>');
                    }
                } else {
                    $("#buttons button.drop-item").removeAttr("disabled");
                }
            }
        }
               
        // update buttons related to current inventory
        var currentInventory=inventory.getCurrentInventory();
        if (currentInventory.length) {
            $("#buttons p.items button.drop, #buttons p.items button.use").removeAttr("disabled");
            if (typeof currentInventory != "undefined" && currentInventory.length) {
                $("#buttons button.drop, #buttons button.use").removeAttr("disabled");
                $("#buttons p.drop, #buttons p.use").empty();
                for (var i=0; i<currentInventory.length; i++) {
                    $("#buttons p.drop").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="drop-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">Drop '+ currentInventory[i].name.toUpperCase()+'</button>');
                    $("#buttons p.use").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="use-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30">Use '+ currentInventory[i].name.toUpperCase()+'</button>');
                }
            }
        }
        $("#buttons p.examine, #buttons p.get, #buttons p.drop, #buttons p.use").append('<button data-action="cancel" class="item-cancel bg-slate-500 text-white disabled:text-gray-200 font-mono p-2 pl-4 pr-4 mr-2 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-slate-800 disabled:hover:bg-slate-500 disabled:opacity-30">CANCEL</button>');
        this.initClickHandlers();

    },

    // scroll game window to bottom on resize
    scrollGameToBottom: function(speed=250) {
        $("#game").animate({ scrollTop: $('#game').get(0).scrollHeight }, speed);  
    }

}

// init the game object once the DOM is loaded
$(document).ready(function() {
    game.init();
});