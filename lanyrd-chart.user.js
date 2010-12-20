// ==UserScript==
// @name lanyrd chart
// @namespace http://flabbergasted.me/greasemonkey/
// @description	king of the hill conference goers in your twitter streams
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require       http://processingjs.org/content/download/processing-js-1.0.0/processing-1.0.0.min.js
// @include	http://lanyrd.com/
// ==/UserScript==
//make sure there is a console.log writer available
if(unsafeWindow.console){
   var GM_log = unsafeWindow.console.log;
}

//Compare function used to sort which twitter users attends most conferences
function compareArrays ( aKey, bKey )
{
  a = top_attender[aKey];
  b = top_attender[bKey];
  if ( a.length > b.length )
    return -1;
  if ( a.length < b.length )
    return 1;
  return 0; // a == b
}

//processing.js function to draw the top-attender graph
function sketchTopAttender(processing) {
	var centerX = processing.width / 2, centerY = processing.height / 2;  
	var radius = Math.min(processing.width, processing.height) * 0.95;
	var topAttenderTableData = new Array();
	
	processing.setup = function() {	
		total_attenders = 0;
		for(i=0;i<top_attender.keys.length;i++) {
			key = top_attender.keys[i];
			total_attenders += top_attender[key].length;
		}
		var degressPerVisit = 360 / total_attenders;
		topAttenderTableData.push(0);
		for(i=0;i<top_attender.keys.length;i++) {
			key = top_attender.keys[i];
			topAttenderTableData.push( top_attender[key].length * degressPerVisit);
		}
	}
	
	processing.draw = function() { 
		// erase background  
		processing.background(140);
		processing.noStroke();
		from = processing.color(200, 40, 40);
		to = processing.color(40, 40, 200);
		lerpInc = 1.0 / topAttenderTableData.length;
		for(i=0;i<topAttenderTableData.length;i++) {
			begin = topAttenderTableData[i];
			end = topAttenderTableData[i+1] || 360;
			processing.fill( processing.lerpColor(from, to, lerpInc*i) );
			processing.arc(centerX,centerY,radius,radius, begin , end);
		}
	}
}

//create a small datastructure for keys and array
var top_attender = new Array();
top_attender.keys = new Array();

//iterate through the people attending elements on the page
// store the name of the conference and assoicate it with the twitter ids sigend up to
$(".conference.vevent").each(function(i) {
	var conferenceName = $(this).find(".summary.url").text();
	$(this).find("ul.people-attending > li").each(function(i) {
		var user = $(this).find("img").attr("alt").split(" ");
		var userName = user[user.length-1] 
		if($.inArray(userName, top_attender.keys) < 0) {
			top_attender.keys.push(userName);
			top_attender[userName] = [conferenceName];
		}else {
			top_attender[userName].push(conferenceName);
		}
	});
});

//sort the array according to most conferences signed up for, high to low
top_attender.keys.sort(compareArrays);

//put together a li element with a anchor tag and a table that represents the top 3 conference goers you follow on twitter
html = "<li>"
html += "<a href='#lanyrd-top-attenders'>Your top 3 goers</a>"
html += "<div id='lanyrd-top-attenders' style='float:right;'>";
html += "<canvas id='top-attender-canvas' style='width:100px;height:100px;'></canvas>"
html += "</div>"
html += "</li>"

//attach the list entry to the main meny of lanyard and hide the canvas by default by default
$(".navigation.section > .article > .inner > .nav").append(html);
$("#lanyrd-top-attenders").hide();

//create the processing sketch
var topAttenderCanvas = document.getElementById("top-attender-canvas");  
var topAttenderInstance = new Processing(topAttenderCanvas, sketchTopAttender);

//when the menu option is pressed hide or show the top three table
$("a[href=#lanyrd-top-attenders]").click(function(e){
	$("#lanyrd-top-attenders").toggle();
	e.preventDefault();
});

//just throw up a alert dialog with which conferences the twitter id is attending
$("a.lanyrd-top-attender").click(function(e){
	key = $(this).text();
	alert(top_attender[key].join("\n"));
	e.preventDefault();
});