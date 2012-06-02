var js = document.createElement('script');
js.setAttribute('data-base', chrome.extension.getURL('/'));
js.src = chrome.extension.getURL("js/loader.js?v=1_" + new Date().getTime());
js.id='turntable-x';
document.body.appendChild(js);