// ==UserScript==
// @name lanyrd chart
// @namespace http://flabbergasted.me/greasemonkey/
// @description	king of the hill conference goers in your twitter streams
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @include	http://lanyrd.com/
// ==/UserScript==

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

//make sure there is a console.log writer available
if(unsafeWindow.console){
   var GM_log = unsafeWindow.console.log;
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
html += "<div id='lanyrd-top-attenders' style='width:200px;float:right;'>";
html += "<table>"
for(i=0;i<3;i++) {
	key = top_attender.keys[i];
	array = top_attender[key];
	if(key != null && array != null) {
		html += "<tr>";
		html +=	"<td>";
		html += '<a class="lanyrd-top-attender" href="#">' + key + "</a></td>";
		html +=	"<td>" + array.length + "</td>";
		html += "</tr>";
	}
}
html += "</table"
html += "</div>"
html += "</li>"

//attach the list entry to the main meny of lanyard and hide the table by default
$(".navigation.section > .article > .inner > .nav").append(html);
$("#lanyrd-top-attenders").hide();

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
