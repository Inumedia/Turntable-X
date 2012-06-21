var copyArr=function(a){return a.slice(0)};

TurntableX.constObject = null;
TurntableX.roomControl = null;
TurntableX.webSocket = null;
TurntableX.UI = {};
	  
TurntableX.Log("Loaded Turntable-X");

TurntableX.propsToRemove = ["https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/wallpaper.png", 
					"https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/floor.png",
					"https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/gauge.png",
					];
TurntableX.idsToRemove = ["meterNeedle"];

TurntableX.GetRoomControl = function(){
	TurntableX.Log("Getting Room Control + webSocket interface.");
	var sFoundHashedAddr = false;
	for(sVar in turntable){
		if(!TurntableX.roomControl)
			TurntableX.roomControl = turntable[sVar];
		
		if(sFoundHashedAddr){
			TurntableX.webSocket = turntable[sVar];
			break;
		}
			
		sFoundHashedAddr = sVar == "getHashedAddr";
	}
	
	if(TurntableX.roomControl && TurntableX.webSocket)
		TurntableX.GetCallbackObject();
	else setTimeout(TurntableX.GetRoomControl, 100);
	
	/*if(!TurntableX.roomControl) 
		for(sVar in turntable) {
			
			if(!TurntableX.roomControl || !TurntableX.roomControl.selfId)
				/// We'll try to find it again in a couple milli seconds.
				setTimeout(TurntableX.GetRoomControl, 100);
			else{
				/// We have found the room control, and are continuing to find the callback object.
				TurntableX.GetCallbackObject();			
			}
			return;
		} 
		/// We already have the room control, and are continuing to make sure we have the callback object.
	else TurntableX.GetCallbackObject();*/
}

TurntableX.GetCallbackObject = function(){
	TurntableX.Log("Getting callback object.");
	if(!TurntableX.constObject || !TurntableX.constObject.callback)
		for(sVar in TurntableX.roomControl) { 
			var sObj = eval('TurntableX.roomControl.'+sVar);
			if(sObj && sObj.callback){
				/// We've found the callback control object and can now continue loading the custom avatars.
				TurntableX.constObject = sObj;
				TurntableX.FirstTimeInit();
				return; 
			} 
		}
		/// We already have the callback object, so we can just start loading the custom avatars.
	else{ 
		TurntableX.FirstTimeInit();
		return;
	}
	setTimeout(TurntableX.GetCallbackObject, 100);
}

TurntableX.FirstTimeInit = function(){
	TurntableX.chatLayout = ["div.chat-container",
        {}, ["div.chatHeader.black-right-header",
        {}, ["img.icon",
        {
          src: "https://s3.amazonaws.com/static.turntable.fm/images/room/chat_icon.png"
        }],
          ["div.header-text",
          {}, "Chat"],
          ["div##chatSound.chatsound",
          {}, ["div.dingOn", "ding on"],
            ["div.dingMention", "ding mention"],
            ["div.dingOff", "ding off"]
          ],
          ["div.chatResizeIcon"]
        ],
          ["div##chatLog.messages"],
          ["div.chatBar",
          {}, /*["div.guestListButton",
          {
            event: {
              click: function() {
                $("div.guest-list-container").animate({
                  marginLeft: "0px"
                });
                TurntableX.roomControl.cancelNameSuggest();
              },
              mouseover: function() {
                $(this).find(".guestListIcon").addClass("slideRight");
              },
              mouseout: function() {
                $(this).find(".guestListIcon").removeClass("slideRight");
              }
            }
          }, ["div.guestListIcon"]],*/
            ["form##chatForm.chatBox",
            {}, ["input##chatText",
            {
              event: {
                keyup: TurntableX.roomControl.chatTextListener
              },
              type: "text",
              placeholder: "enter a message"
            }]]
          ]
        ];
    this.Init();
}

TurntableX.Init = function(){
	TurntableX.Log("Here we go.");
	var toRemove = [];
	for(var i = 0; i < TurntableX.propsToRemove.length; ++i)
		toRemove.push("img[src='"+TurntableX.propsToRemove[i]+"']");
	for(var i = 0; i < TurntableX.idsToRemove.length; ++i)
		toRemove.push("#" + TurntableX.idsToRemove[i]);
	toRemove.push("a[style='position: absolute; left: 370px; top: 555px; z-index: 10001; ']");
	toRemove.push("a[style='position: absolute; left: 154px; top: 555px; z-index: 10001; ']");
	
	speaker.states.on.push(['lspeaker2',0,0]);
    speaker.states.on.push(['lspeaker3',0,0]);
	
	TurntableX.UI = {
        room_props: room_props.map(copyArr),
        speakerStates: speaker.states.on.map(copyArr),
        laptop_locations: laptop_locations.map(copyArr),
        record_pile_locations: record_pile_locations.map(copyArr),
        becomedj_locations: becomedj_locations.map(copyArr),
        dj_locations: dj_locations.map(copyArr),
        spotlight_locations: spotlight_locations.map(copyArr)
    };
	
	$(toRemove.join(', ')).remove();
		
	TurntableX.innerRoomView = $(".roomView > div:eq(1)").attr("style","").width("78%").height("100%");
	
	TurntableX.chatNodes = {};
	TurntableX.chatTree = util.buildTree(TurntableX.chatLayout, TurntableX.chatNodes);
	TurntableX.roomControl.nodes = $.extend(TurntableX.roomControl.nodes, TurntableX.chatNodes, true);
	$(TurntableX.chatNodes.chatForm).submit(TurntableX.roomControl.speak);
	$(TurntableX.chatNodes.chatText).keydown(TurntableX.roomControl.chatKeyDownListener);
	
	if (!util.getSetting("playdingsound")) {
      var b = util.getSetting("playding") == "true" ? "on" : "mention";
      util.setSetting("playdingsound", b);
    }
    $(TurntableX.chatNodes.chatSound).addClass(util.getSetting("playdingsound"));
    $(TurntableX.chatNodes.chatSound).bind({
      mousedown: function(c) {
        c.stopPropagation();
      },
      selectstart: function(c) {
        c.preventDefault();
      },
      click: function() {
        var d = $(".chatsound");
        var e, c;
        if (d.hasClass("on")) {
          e = "on", c = "mention";
        } else {
          if (d.hasClass("mention")) {
            e = "mention", c = "off";
          } else {
            e = "off", c = "on";
          }
        }
        d.removeClass(e).addClass(c);
        util.setSetting("playdingsound", c);
      }
    });
	$("a[style='position: absolute; left: 370px; top: 555px; z-index: 10001; '], a[style='position: absolute; left: 154px; top: 555px; z-index: 10001; ']").remove();
	
	//$("#playlist, #playlistContainer").remove();
	//$("#maindiv").prepend("<div id='playlistContainer' style='width:15%;height:100%;overflow:auto;float:right;'><div id='playlist'></div></div>");
	//turntable.playlist.init();
	//turntable.playlist.loadList();
	$(".chat-container, .guest-list-container").remove();
	TurntableX.innerRoomView.append(TurntableX.chatTree);
	
	//TurntableX.Resize();
}

TurntableX.Resize = function(){
	roomWidth = TurntableX.innerRoomView.width();
	TurntableX.constObject.floorRects = [
        { rect: [Math.round(roomWidth*.1), 245, Math.round(roomWidth*.2), 100], weight: .2 }, 
        { rect: [Math.round(roomWidth*.3), 295, Math.round(roomWidth*.4), 50], weight: .6 }, 
        { rect: [Math.round(roomWidth*.7), 245, Math.round(roomWidth*.2), 100], weight: .2 }
    ];
	
	// Remove and replace avatars
	for (i in TurntableX.roomControl.users) {                            
	  var user = TurntableX.roomControl.users[i],
		  id = user.userid;
		if (TurntableX.roomControl.djIds.indexOf(id)<0) { 
			TurntableX.constObject.rem_listener(user);
			TurntableX.constObject.add_listener(user);
			if (TurntableX.roomControl.upvoters.indexOf(id)>=0) {
				TurntableX.constObject.update_vote(user, 'up');
			}
		}		
	}
	
	// Remove room props
	var roomProps = $('#top-panel + div img[src*="props"][style]');
	for (i=0; i<roomProps.length; i++) { TurntableX.constObject.blackswan.remove_element(roomProps[i]); }
	// Redefine positions	
	for (i in room_props) { room_props[i][1]=TurntableX.UI.room_props[i][1]+((roomWidth-511)/2); }
	// Insert props
	TurntableX.constObject.blackswan.add_props(room_props)
	
	// Reposition Speaker States
	for (i in speaker.states.on) {
		speaker.states.on[i][1]=((TurntableX.UI.speakerStates[i][0].substr(0,1)=='l')?0:427)+((roomWidth-511)/2);
	}

  // Reposition Laptop, Record Pile, Become DJ, DJ and Spotlight locations
	var locations = ['laptop_locations', 'record_pile_locations', 'becomedj_locations', 'dj_locations', 'spotlight_locations']
	for (i in locations) {
		x=window[locations[i]];
		o=TurntableX.UI[locations[i]];
		for (j in x) {
			x[j][0]=o[j][0]+((roomWidth-511)/2)
		}
	}
	// Remove record piles
  $('.record_pile').each(function() { TurntableX.constObject.blackswan.remove_element(this); });
	TurntableX.constObject.record_piles={};
	
	// Add record piles
	for (var j = 0; j < TurntableX.constObject.dj_spots; ++j) {
		var k = $('<div class="record_pile"></div>');
		k.data("spot", j);
		if (j == 0) { k.hide(); }
		TurntableX.constObject.record_piles[j] = k;
		TurntableX.constObject.blackswan.add_element(k, record_pile_locations[j], 116);
	}

  // Reposition Become DJ & Invite DJ Buttons
	TurntableX.constObject.blackswan.add_element(TurntableX.constObject.invite_dj, becomedj_locations[0], 116, true);
	TurntableX.constObject.blackswan.add_element(TurntableX.constObject.become_dj, becomedj_locations[0], 116, true);		
				
  // Remove & Replace DJs
	for (i in TurntableX.roomControl.djIds) { 
		TurntableX.constObject.rem_dj(i); 
		TurntableX.constObject.add_dj(TurntableX.roomControl.users[TurntableX.roomControl.djIds[i]], i) 
		if (TurntableX.roomControl.upvoters.indexOf(TurntableX.roomControl.djIds[i])>=0) {
			TurntableX.constObject.update_vote(TurntableX.roomControl.users[TurntableX.roomControl.djIds[i]], 'up');
		}
	}
	// Reset Current DJ
	TurntableX.constObject.stop_active_dj();
	TurntableX.constObject.set_active_dj(TurntableX.roomControl.djIds.indexOf(TurntableX.roomControl.currentDj))	
	
	// Repositioning the Songboard
	$('#songboard_hotspot').css({left: ((roomWidth-511)/2)+84})	
	TurntableX.constObject.blackswan.remove_element(TurntableX.constObject.songboard)
	TurntableX.constObject.blackswan.add_element(TurntableX.constObject.songboard, [((roomWidth-511)/2)+84, 147], 116, true)				

	// Reposition Speakers & Mute Volume Containers
	$('#left_speaker').css({left: ((roomWidth-511)/2)})
	$('#right_speaker').css({left: ((roomWidth-511)/2)+434})
	$('.mv_container:nth(0)').css({left: ((roomWidth-511)/2)})
	$('.mv_container:nth(1)').css({left: ((roomWidth-511)/2)+434})
	TurntableX.constObject.blackswan.add_dancer(speaker, false, [((roomWidth-511)/2)+15, 194], false, false)
	
	// Reset Speaker State
	TurntableX.constObject.speaker.state('off')
	TurntableX.constObject.speaker.state('on')
}

room_props = [["https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/dj_table.png", 8, 111, 115]];
BuddyListPM.prototype.toggle = function(){}
BuddyListPM.prototype.isClosed = function(){ return false; }
turntable.old_reloadPage = turntable.reloadPage;
turntable.reloadPage = function(){
	TurntableX.Log("Welp.", arguments);
	this.old_reloadPage.apply(this,arguments);
	TurntableX.roomControl = null;
	TurntableX.mContObject = null;
	TurntableX.GetRoomControl();
}

Room.prototype.old_setupRoom = Room.prototype.setupRoom;
Room.prototype.setupRoom = function(){
	TurntableX.Log("Welp2.", arguments);
	this.old_setupRoom.apply(this,arguments);
	TurntableX.roomControl = null;
	TurntableX.mContObject = null;
	TurntableX.GetRoomControl();
}

/// This is where we begin :D
$(document).ready(TurntableX.GetRoomControl)
