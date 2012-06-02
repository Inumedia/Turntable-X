TurntableX.mConstObject = null;
TurntableX.mConstObjectName = null;
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
				TurntableX.Init();
				return; 
			} 
		}
		/// We already have the callback object, so we can just start loading the custom avatars.
	else{ 
		TurntableX.Init();
		return;
	}
	setTimeout(TurntableX.GetCallbackObject, 100);
}

TurntableX.Init = function(){
	TurntableX.Log("Here we go.");
	for(var i = 0; i < TurntableX.propsToRemove.length; ++i)
		$("img[src='"+TurntableX.propsToRemove[i]+"']").remove();
	for(var i = 0; i < TurntableX.idsToRemove.length; ++i)
		$("#" + TurntableX.idsToRemove[i]).remove();
		
	TurntableX.innerRoomView = $(".roomView > div:eq(1)").attr("style","").width("100%").height("100%");
	
	$("#playlist").remove();
	$("#maindiv").append("<div id='playlist'></div>");
}

room_props = [["https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/props/dj_table.png", 8, 111, 115]];
BuddyListPM.prototype.toggle = function(){}
BuddyListPM.prototype.isClosed = function(){ return false; }
turntable.playlist.old_init = turntable.playlist.init;
turntable.playlist.init = function(){
	if(!this.initialized)
		this.old_init.apply(this, arguments);
	this.initialized = true;
}
turntable.old_reloadPage = turntable.reloadPage;
turntable.reloadPage = function(){
	TurntableX.Log("Welp.", arguments);
	this.old_reloadPage.apply(this,arguments);
	TurntableX.Init();
}

/// This is where we begin :D
$(document).ready(TurntableX.GetRoomControl)
