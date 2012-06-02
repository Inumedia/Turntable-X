TurntableX.mConstObject = null;
TurntableX.mRoomControl = null;
TurntableX.Log("Loaded Turntable-X");

TurntableX.propsToRemove = ["https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/wallpaper.png", 
					"https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/floor.png",
					"https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/gauge.png",
					];
TurntableX.idsToRemove = ["meterNeedle"];

TurntableX.GetRoomControl = function(){
	TurntableX.Log("Getting Room Control")
	if(!TurntableX.mRoomControl) 
		for(sVar in turntable) {
			TurntableX.mRoomControl = eval('turntable.'+sVar);
			
			if(!TurntableX.mRoomControl || !TurntableX.mRoomControl.selfId)
				/// We'll try to find it again in a couple milli seconds.
				setTimeout(TurntableX.GetRoomControl, 100);
			else{
				/// We have found the room control, and are continuing to find the callback object.
				TurntableX.GetCallbackObject();			
			}
			return;
		} 
		/// We already have the room control, and are continuing to make sure we have the callback object.
	else TurntableX.GetCallbackObject();
}

TurntableX.GetCallbackObject = function(){
	TurntableX.Log("Getting callback object.");
	if(!TurntableX.mConstObject || !TurntableX.mConstObject.callback)
		for(sVar in TurntableX.mRoomControl) { 
			var sObj = eval('TurntableX.mRoomControl.'+sVar);
			if(sObj && sObj.callback){
				/// We've found the callback control object and can now continue loading the custom avatars.
				TurntableX.mConstObject = sObj;
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
                TurntableX.mRoomControl.cancelNameSuggest();
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
                keyup: TurntableX.mRoomControl.chatTextListener
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
	for(var i = 0; i < TurntableX.propsToRemove.length; ++i)
		$("img[src='"+TurntableX.propsToRemove[i]+"']").remove();
	for(var i = 0; i < TurntableX.idsToRemove.length; ++i)
		$("#" + TurntableX.idsToRemove[i]).remove();
		
	TurntableX.innerRoomView = $(".roomView > div:eq(1)").attr("style","").width("78%").height("100%");
	
	TurntableX.chatNodes = {};
	TurntableX.chatTree = util.buildTree(TurntableX.chatLayout, TurntableX.chatNodes);
	TurntableX.mRoomControl.nodes = $.extend(TurntableX.mRoomControl.nodes, TurntableX.chatNodes, true);
	$(TurntableX.chatNodes.chatForm).submit(TurntableX.mRoomControl.speak);
	$(TurntableX.chatNodes.chatText).keydown(TurntableX.mRoomControl.chatKeyDownListener);
	
	//$("#playlist, #playlistContainer").remove();
	//$("#maindiv").prepend("<div id='playlistContainer' style='width:15%;height:100%;overflow:auto;float:right;'><div id='playlist'></div></div>");
	//turntable.playlist.init();
	//turntable.playlist.loadList();
	$(".chat-container, .guest-list-container").remove();
	TurntableX.innerRoomView.append(TurntableX.chatTree);
}

room_props = [["https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/dj_table.png", 8, 111, 115]];
BuddyListPM.prototype.toggle = function(){}
BuddyListPM.prototype.isClosed = function(){ return false; }
turntable.old_reloadPage = turntable.reloadPage;
turntable.reloadPage = function(){
	TurntableX.Log("Welp.", arguments);
	this.old_reloadPage.apply(this,arguments);
	TurntableX.mRoomControl = null;
	TurntableX.mContObject = null;
	TurntableX.GetRoomControl();
}

Room.prototype.old_setupRoom = Room.prototype.setupRoom;
Room.prototype.setupRoom = function(){
	TurntableX.Log("Welp2.", arguments);
	this.old_setupRoom.apply(this,arguments);
	TurntableX.mRoomControl = null;
	TurntableX.mContObject = null;
	TurntableX.GetRoomControl();
}

/// This is where we begin :D
$(document).ready(TurntableX.GetRoomControl)
