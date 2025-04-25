var game = {
    
    x: 0,
    y: 0,
    fontSize: "lg",
    typingEffect: "off",
    transforms: JSON.parse('{ "north": { "x": 0, "y": -1 }, "east":  { "x": 1, "y": 0 }, "south": { "x": 0, "y": 1 }, "west": { "x": -1, "y": 0 } }'),

    // initialize the game
    init: function() {
        this.getGameState();
        this.initSettingsMenu();
        map.init();
        inventory.init();
        $("#game #locations").append("<p>&nbsp;</p>") // spacer
        this.renderLocation(this.x, this.y);
    },

    // get game state values from localStorage
    // if they are not yet set, save the defaults
    getGameState: function() {
        var gameState=localStorage.getItem("adv-game");
        gameState=JSON.parse(gameState);
        if (gameState == null) {
            this.saveGameState();
            return;
        }
        this.x=gameState.x;
        this.y=gameState.y;
        this.fontSize=gameState.fontSize;
        this.typingEffect=gameState.typingEffect;
    },

    saveGameState: function() {
        localStorage.setItem("adv-game", JSON.stringify({
            x: this.x,
            y: this.y,
            fontSize: this.fontSize,
            typingEffect: this.typingEffect
        }));
    },

    initSettingsMenu: function() {
        var thisContext=this;
        $("#settings-icon").off("click").on("click", function() {
            if ($("#settings-menu").is(":visible")) {
                $("#game #buttons").css("visibility", "visible");
            } else {
                $("#settings-menu .font-size button#font-"+thisContext.fontSize).addClass("selected");
                $("#settings-menu .typing-effect button#typing-"+thisContext.typingEffect).addClass("selected");
                $("#game #buttons").css("visibility", "hidden");
            }
            $("#settings-menu").slideToggle(400, function() {
                thisContext.scrollGameToBottom();
            });            
        });
        $("#reset-game").off("click").on("click", function() {
            if (confirm("Are you sure? All game progress will be permanently lost.")) {
                thisContext.x=0;
                thisContext.y=0;
                thisContext.saveGameState();
                localStorage.removeItem("adv-inventory");
                localStorage.removeItem("adv-locations");
                $("#settings-menu").slideToggle(400);
                setTimeout(function() {
                    $("#game #locations").empty();
                    $("#game #buttons").hide();
                    thisContext.init();
                }, 1000);
            }
        });
        $("#settings-menu .font-size button").off("click").on("click", function() {
            thisContext.fontSize=$(this).attr("data-size");
            thisContext.saveGameState();
            $("#settings-menu .font-size button").removeClass("selected");
            $("#settings-menu .font-size button#font-"+thisContext.fontSize).addClass("selected");
            $("#game #locations p").removeClass("text-sm text-base text-lg text-xl").addClass("text-"+thisContext.fontSize);
        });
        $("#settings-menu .typing-effect button").off("click").on("click", function() {
            thisContext.typingEffect=$(this).attr("data-value");
            thisContext.saveGameState();
            $("#settings-menu .typing-effect button").removeClass("selected");
            $("#settings-menu .typing-effect button#typing-"+thisContext.typingEffect).addClass("selected");
        });
        $("#close-settings-menu").off("click").on("click", function() {
            $("#settings-icon").trigger("click");
        });
    },

    // build the full text to output for a requested x,y location
    renderLocation: function(x, y) {
        $("#game #buttons").css("visibility","hidden");
        var location=map.getLocation(this.x, this.y);
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
            if (location.dirs[dir]) {
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
        items=inventory.getLocationItems(this.x, this.y, true);
        if (items.length) {
            text+="\n\nThere is ";
            for (var i=0; i<items.length; i++) {
                if (!items[i].isInInventory && items[i].notify) {
                    text+=" a " + items[i].name;
                    if (i<items.length-2) {
                        text+=", ";
                    }
                    if (i==items.length-2) {
                        text+=" and ";
                    }
                }
            }
            text+=" here.";
        }

        // reset location buttons related to items
        this.resetCurrentLocationItemButtons();
        $("#buttons .look").hide();

        // format line breaks in the location text
        text=text.replaceAll("\n","|");

        // output the full location description, directions and items to the game screen
        this.renderGameText('location', text, img, function() {
            $("#buttons p.look button").removeAttr("disabled");
            if (!$("#settings-menu").is(":visible")) {
                $("#buttons p.directions, #buttons p.items").show();
                $("#buttons p.look").hide();
                $("#buttons").css("visibility","visible");
            }
        });

    },

    // wrap location text in the required HTML, and trigger related typing and scrolling animations
    renderGameText: function(type='location', text, img='', callback) {
        var elId="el-"+Math.floor(Math.random() * 99999999);
        var html='<div class="'+type+' mt-2 mb-2 pt-2 pb-2"><p class="m-2 text-'+this.fontSize+'" id="'+elId+'">';
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
        }, 350);
        
    },

    // output text character-by-character into specified element
    typeText: function(elId, text, char, gameHeight, callback) {
        if (this.typingEffect!="on") {
            $("#"+elId).html(text.replaceAll("|",'<br>')); 
            this.scrollGameToBottom();
            if (typeof callback == "function") {
                callback();
            }
            return;
        }
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
            //$("#game #buttons").css("visibility","visible");
            this.scrollGameToBottom();
            if (typeof callback == "function") {
                if (typeof callback == "function") {
                    setTimeout(function() {
                        callback();
                    }, 600);
                }
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
            var dest=thisContext.transformCoords(thisContext.x, thisContext.y, dir);
            thisContext.x=dest.x;
            thisContext.y=dest.y;
            thisContext.saveGameState();
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Go ' + dir + '</div>');
            thisContext.renderLocation(dest.x, dest.y);
        });
        $("#buttons button.examine").off("click").on("click", function() {
            $("#buttons p.examine").show();
            $("#buttons").css("min-height",$("#buttons").height()+"px");
            $("#buttons p.directions, #buttons p.items, #buttons p.look").hide();
        });
        $("#buttons button.get").off("click").on("click", function() {
            $("#buttons p.get").show();
            $("#buttons").css("min-height",$("#buttons").height()+"px");
            $("#buttons p.directions, #buttons p.items, #buttons p.look").hide();
        });
        $("#buttons button.drop").off("click").on("click", function() {
            $("#buttons p.drop").show();
            $("#buttons").css("min-height",$("#buttons").height()+"px");
            $("#buttons p.directions, #buttons p.items, #buttons p.look").hide();
        });
        $("#buttons button.use").off("click").on("click", function() {
            $("#buttons p.use").show();
            $("#buttons").css("min-height",$("#buttons").height()+"px");
            $("#buttons p.directions, #buttons p.items, #buttons p.look").hide();
        });
        $("#buttons button.item-cancel").off("click").on("click", function() {
            thisContext.resetCurrentLocationItemButtons();
            thisContext.scrollGameToBottom();
        });
        $("#buttons button.examine-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2 mb-2">&#8618; Examine ' + $(this).attr("data-item-name") + '</div>');
            thisContext.renderGameText('action', $(this).attr("data-item-examine"), '', function() {
                $("#buttons p.look button").removeAttr("disabled");
                if (!$("#settings-menu").is(":visible")) {
                    $("#buttons").css("min-height","auto");
                    $("#buttons, #buttons p.directions, #buttons p.items, #buttons p.look").show();
                }
                thisContext.scrollGameToBottom();
            });
        });
        $("#buttons button.get-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#buttons").css("min-height","auto");
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2 mb-2">&#8618; Get ' + $(this).attr("data-item-name") + '</div>');
            inventory.addItemToInventory($(this).attr("data-item-id"));
            thisContext.renderGameText('action', "You pick up the " + $(this).attr("data-item-name") +'.', '', function() {
                thisContext.resetCurrentLocationItemButtons();
                thisContext.scrollGameToBottom();
            });
        });
        $("#buttons button.drop-item").off("click").on("click", function() {
            $("#buttons, #buttons p").hide();
            $("#buttons").css("min-height","auto");
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2 mb-2">&#8618; Drop ' + $(this).attr("data-item-name") + '</div>');
            inventory.dropItemFromInventory($(this).attr("data-item-id"), thisContext.x, thisContext.y);
            thisContext.renderGameText('action', "You drop the " + $(this).attr("data-item-name") +'.', '', function() {
                thisContext.resetCurrentLocationItemButtons();
                thisContext.scrollGameToBottom();
            });
        });
        $("#buttons button.use-item").off("click").on("click", function() {
            //$("#buttons, #buttons p").hide();
            $("#buttons").css("min-height","auto");
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; Use ' + $(this).attr("data-item-name") + '</div>');
            var item=inventory.getItemDetailsById($(this).attr("data-item-id"));
            if (typeof item == "undefined" || !item.use) {
                thisContext.renderGameText('action', "You see no use for the " + $(this).attr("data-item-name") + " right now.", '', function() {
                    thisContext.resetCurrentLocationItemButtons();
                    thisContext.scrollGameToBottom();
                });
            } else if (item.use.x != thisContext.x || item.use.y != thisContext.y) {
                thisContext.renderGameText('action', "You see no use for the " + $(this).attr("data-item-name") + " right now.", '', function() {
                    thisContext.resetCurrentLocationItemButtons();
                    thisContext.scrollGameToBottom();
                });
            } else {
                var itemId=$(this).attr("data-item-id");
                thisContext.renderGameText('action', item.use.result, '', function() {
                    if (item.use.deleteAfter) {
                        inventory.deleteItem(itemId);
                    }
                    hooks.runHook("hook_"+itemId);
                });
            }
        });
        $("#buttons button.look-around").off("click").on("click", function() {
            $("#locations").append('<div class="action bg-transparent text-black font-bold font-mono text-sm uppercase m-0 pl-2 pt-2 pb-2">&#8618; LOOK AROUND</div>');
            thisContext.renderLocation(thisContext.x, thisContext.y);
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

        var thisContext=this;

        // reset button states to default
        $("#buttons, #buttons p.directions, #buttons p.items").show();
        $("#buttons p.items .examine, #buttons p.items .get, #buttons p.items .drop, #buttons p.items .use").attr("disabled","disabled");
        $("#buttons p.examine, #buttons p.get, #buttons p.drop, #buttons p.use").empty().hide();

        // enable and show the 'look around again' button
        $("#buttons p.look").hide();
        if (!$("#game #locations > div:last").hasClass("location")) {
            $("#buttons p.look").show().find("button").removeAttr("disabled");
        }

        // update buttons related to items at current location
        var items=inventory.getLocationItems(this.x, this.y);
        if (items.length) {
            for (var i=0; i<items.length; i++) {
                if (items[i].isGettable && !items[i].isInInventory) {
                    $("#buttons p.get").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" class="get-item bg-blue-500 text-white disabled:text-gray-200 font-mono w-auto p-3 px-4 mx-1 my-3  rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">GET '+ items[i].name.toUpperCase()+'</span></button> ');
                }
                if (items[i].use && !items[i].isGettable) {
                    $("#buttons p.use").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" class="use-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-3 px-4 mx-1 my-3 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">USE '+ items[i].name.toUpperCase()+'</span></button> ');
                }
                if (!items[i].isInInventory) {
                    $("#buttons p.examine").append('<button data-item-id="'+items[i].id+'" data-item-name="'+items[i].name+'" data-item-examine="'+items[i].examine +'" class="examine-item bg-blue-500 text-white disabled:text-gray-200 font-mono w-auto p-3 px-4 mx-1 my-3  rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">EXAMINE '+ items[i].name.toUpperCase()+'</span></button> ');
                }
            }
        }

        // update buttons related to current inventory
        var currentInventory=inventory.getCurrentInventory();
        if (currentInventory.length) {
            for (var i=0; i<currentInventory.length; i++) {
                $("#buttons p.drop").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="drop-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-3 px-4 mx-1 my-3 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">DROP '+ currentInventory[i].name.toUpperCase()+'</span></button> ');
                $("#buttons p.examine").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="drop-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-3 px-4 mx-1 my-3 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">EXAMINE '+ currentInventory[i].name.toUpperCase()+'</span></button> ');
                if (currentInventory[i].use !== null) {
                    $("#buttons p.use").append('<button data-item-id="'+currentInventory[i].id+'" data-item-name="'+currentInventory[i].name+'" class="use-item bg-blue-500 text-white disabled:text-gray-200 font-mono p-3 px-4 mx-1 my-3 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-blue-800 disabled:hover:bg-blue-500 disabled:opacity-30"><span class="whitespace-nowrap">USE '+ currentInventory[i].name.toUpperCase()+'</span></button> ');
                }
            }
        }

        // enable only item action buttons that have been populated
        ['examine', 'get',, 'drop', 'use'].forEach(function(action) {
            if ($("#buttons p."+action+" button").length) {
                $("#buttons p.items button."+action).removeAttr("disabled");
                $("#buttons p."+action).append('<button data-action="cancel" class="item-cancel bg-slate-500 text-white disabled:text-gray-200 font-mono w-auto p-3 px-4 mx-1 my-3 rounded-sm text-sm cursor-pointer disabled:cursor-auto hover:bg-slate-800 disabled:hover:bg-slate-500 disabled:opacity-30"><span class="whitespace-nowrap">CANCEL</span></button> ');
            }
        });


        thisContext.initClickHandlers();

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