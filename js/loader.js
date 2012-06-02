

var TurntableX = { 
	Log: function(a){ console.log(util.nowStr()+' Turntable-X >> '+a); },
	Base: $('#turntable-x').data('base')
};

//DEBUG_MODE=1;

TurntableX.LoadJavascript = function(f,g,h) {
  var d = new jQuery.Deferred();
  
  var js = document.createElement('script');
  js.src = TurntableX.Base + 'js/'+f+'.js?v=' + Date.now();
  if (h&&h.url) {
    js.src = h.url+f+'.js';
  }
  
  document.body.appendChild(js);

	TurntableX.Log("Loading JS" + js.src);

  setTimeout(function() {
    if (!h && window[g]) {
      d.resolve()
    }
    else if (h && !h.false && window[g]) {
      d.resolve()
    }
    else if (h && h.false && !window[g]) {
      d.resolve()
    }
    else {
      setTimeout(function(a) { a(); }, 50, arguments.callee)
    }
  }, 50)
  return d.promise(); 
}

TurntableX.Log("Initializing");
$.when(
  TurntableX.LoadJavascript('underscore', '_')
).then(function() {
  $.when(
	TurntableX.LoadJavascript('script', 'TurntableX.mConstObject')
  ).then(function() {
  	TurntableX.Log("Ready.");
  })
})
