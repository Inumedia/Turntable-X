TurntableX.TurntableX.mConstObject = null;
TurntableX.TurntableX.mConstObjectName = null;
TurntableX.TurntableX.mRoomControl = null;
TurntableX.Log("Loaded Custom Avatars");

TurntableX.GetRoomControl = function(){
	TurntableX.Log("Getting Room Control")
	if(!TurntableX.TurntableX.mRoomControl) 
		for(sVar in turntable) {
			TurntableX.TurntableX.mRoomControl = eval('turntable.'+sVar);
			
			if(!TurntableX.mRoomControl || !TurntableX.mRoomControl.selfId)
				/// We'll try to find it again in a couple milli seconds.
				setTimeout(GetRoomControl, 100);
			else{
				/// We have found the room control, and are continuing to find the callback object.
				GetCallbackObject();			
			}
			return;
		} 
		/// We already have the room control, and are continuing to make sure we have the callback object.
	else GetCallbackObject();
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
	setTimeout(GetCallbackObject, 100);
}

TurntableX.Init = function(){
	
}

/// This is where we begin :D
$(document).ready(TurntableX.GetRoomControl)
