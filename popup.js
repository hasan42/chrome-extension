function init(){
	parseDone = localStorage.getItem('kpParseStart');
	if(parseDone === 'true'){
		$("#downloadAnchorElem").show();
	}
}

$("#startParse").click(function(){
	// chrome.storage.sync.set({"filmItems": [], "allPage": 0, "currentPage": 1, "kinopoiskId": 1098694, "startParse": true}, function() {
	// 	console.log('chrome.storage save');
	// });

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    chrome.tabs.executeScript(
	        tabs[0].id,
	        {code: 'let event = new Event("kpStartScriptParser"); document.dispatchEvent(event);'});
	});
});

$("#downloadAnchorElem").click(function(){
	event.preventDefault();
	let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage.getItem('filmItems')));
	let dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", "films-list.json");
	dlAnchorElem.click();
});

$("#sequelKpFile").on("click", function(event){
	// let file = event.target.files[0]; // FileList object
	// let fr = new FileReader();
	// fr.onload = receivedText;
	// fr.readAsText(file);
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		// chrome.tabs.sendMessage(
		// 	tabs[0].id,
		// 	newArr,
		// 	function(){
		// 		console.log('send msg')
		// 	}
		// );
	    chrome.tabs.executeScript(
	        tabs[0].id,
	        {code: 'let event = new Event("kpStartScriptFindSequel"); document.dispatchEvent(event);'});
	});
});

function receivedText(e) {
	let lines = e.target.result;
	let newArr = JSON.parse(lines);
	localStorage.setItem('filmItemsFindSequels', newArr);

	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			newArr,
			function(){
				console.log('send msg')
			}
		);
	    chrome.tabs.executeScript(
	        tabs[0].id,
	        {code: 'let event = new Event("kpStartScriptFindSequel"); document.dispatchEvent(event);'});
	});
}