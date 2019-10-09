'use strict';

let startParse = 'false', parseDone = 'false', startParseSequel = 'false', doneParseSequel = 'false';
let kinopoiskId = '1098694', allPage = 0, items = [], currentPage = 1;

function initParserKP(){
	startParse = localStorage.getItem('kpParseStart');
	if(startParse === 'true'){
		items = JSON.parse( localStorage.getItem('filmItems') );
		allPage = Number(localStorage.getItem('allPage'));
		currentPage = Number(localStorage.getItem('currentPage'));
		kinopoiskId = localStorage.getItem('kinopoiskId');

	}else{
		localStorage.setItem('filmItems', '');
		localStorage.setItem('allPage', '0');
		localStorage.setItem('currentPage', '1');
		localStorage.setItem('kinopoiskId', '1098694');
		localStorage.setItem('kpParseStart', 'true');
	}
}

function initSeq(){
	startParse = localStorage.getItem('kpParseSequelStart');
	if(startParse != 'false'){
		localStorage.setItem('kpParseSequelStart', 'true');
	}
}

function calcCountPage(allPageLinkStr){
	let linkNextPageLength = "/user/"+kinopoiskId+"/votes/list/ord/date/page/";
	let strStart = linkNextPageLength.length;
	if(allPageLinkStr != undefined && allPageLinkStr.length > 0){
		return Number(allPageLinkStr.slice(strStart, -6));
	}
}
function startIt(){
	// console.log(items, allPage, currentPage, kinopoiskId);
	if(allPage === 0){
		let allPageLinkStr = document.querySelector(".historyVotes .navigator .list li:last-child a").getAttribute("href");
		allPage = calcCountPage(allPageLinkStr);
		localStorage.setItem('allPage', allPage);
	}

	let links = document.querySelectorAll(".profileFilmsList .item");
	links.forEach((el) => {
		items.push({
			id: el.querySelector(".nameRus a").getAttribute("href").slice(6, -1),
			link: el.querySelector(".nameRus a").getAttribute("href"),
			nameRus: el.querySelector(".nameRus a").textContent,
			nameEng: el.querySelector(".nameEng").textContent,
			vote: el.querySelector(".rateNow").getAttribute("vote")
		});
	});

	localStorage.setItem('filmItems', JSON.stringify( items ));

	console.log(currentPage, allPage)

	if(currentPage != allPage){
		setTimeout(()=>{
			currentPage = currentPage + 1;
			localStorage.setItem('currentPage', currentPage);
			window.location.href = "http://www.kinopoisk.ru/user/" + kinopoiskId + "/votes/list/ord/date/page/" + currentPage + "/#list";
		}, 3000);
	}
	if(currentPage === allPage){
		console.log('parse done')
		localStorage.setItem('kpParseDone', 'true');
		downloadObjectAsJson("filmItems", "films-list" );
	}
}

function startSequel(){
	if($("body").hasClass("b-page_type_kinopoisk")){
		return;
	}
	let filmList = JSON.parse(localStorage.getItem('filmItems'));

	filmList.map((item) => {
		//check take sequel or episodes
		if( !item.hasOwnProperty("sequel") && !item.hasOwnProperty("serial") ){
			//parse or need relocation
			let currentLocation = window.location.href;
			if(currentLocation.includes(item.link)){
				//have sequel
				if(document.querySelector(".sequel_scroller")){
					console.log('true')
					let sequelInfo = {
						sequelParent: '',
						items: []
					};
					let seqIt = document.querySelectorAll(".sequel_scroller .scroll_photo");
					seqIt.forEach((el) => {

						let sequelIndex = el.querySelector("span .num").textContent;
						let sequelId = el.querySelector("span a").getAttribute("href");
						if(sequelId === "#"){
							sequelId = document.querySelector(".sequel_scroller .headerLink").getAttribute("href").slice(6, -7);
						}else{
							sequelId = sequelId.slice(6, -1)
						}
						if(sequelIndex === '1'){
							sequelInfo.sequelParent = sequelId;
						}
						sequelInfo.items.push({
							id: sequelId,
							serial: sequelIndex
						});
					});
					item.sequel = sequelInfo;
				}else{
					console.log('false')
					item.sequel = false;
				}

				let linkWithEpisodes = document.querySelector(".movie-info__table table.info tr:first-child td:last-child a.all");

				if(linkWithEpisodes){
					console.log('true')
					item.serial = true;
					
				}else{
					console.log('false')
					item.serial = false;
				}

				localStorage.setItem('filmItems', JSON.stringify( filmList ));

			}else{
				let randomnumber = Math.floor(Math.random() * (6 - 2 + 1)) + 2;
				setTimeout(()=>{
					window.location.href = "http://www.kinopoisk.ru" + item.link;
				}, randomnumber*1000);
			}
		}
	});
	// localStorage.setItem('doneParseSequel', 'true');
}

function downloadObjectAsJson( content, fileName ){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage.getItem(content)));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", fileName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

startParse = localStorage.getItem('kpParseStart');
parseDone = localStorage.getItem('kpParseDone');
startParseSequel = localStorage.getItem('kpParseSequelStart');
doneParseSequel = localStorage.getItem('kpParseSequelDone');

document.addEventListener("kpStartScriptParser", function(event) {
	console.log('kpStartScriptParser')
	initParserKP();

	if(parseDone === 'true'){
		console.log('parse done');
		downloadObjectAsJson("filmItems", "films-list" );
	  	return;
	}

	startIt();
});

document.addEventListener("kpStartScriptFindSequel", function(event) {
	
	console.log('kpStartScriptFindSequel')
	localStorage.setItem('kpParseStart', 'false')
	localStorage.setItem('kpParseSequelStart', 'true');

	if(doneParseSequel === 'true'){
		console.log('parse done');
		downloadObjectAsJson("filmItemsFindSequels", "films-sequel-list" );
	  	return;
	}

	startSequel();
});

if(startParse === 'true'){
	console.log('start')
	let event = new Event("kpStartScriptParser");
  	document.dispatchEvent(event);
}

if(startParseSequel === 'true'){
	console.log('start sequel')
	let event = new Event("kpStartScriptFindSequel");
  	document.dispatchEvent(event);
}