/* this file do the application request
 * and get the data from the remote server
 *
 * use jQuery Ajax
 */ 

/*
 * communication protocol
 * request=all&from=a&to=b; request for all message[mayve the can be an range, so that minus the unnecessary data]
 * request=sync&id=id list; this is an id list
 * request=unsync&id=id list; this is a id list
 * 
 */

/*
 * $.get( url [, data][, callback][, type])
 * $.post( url [, data][, callback][, type])
 * URL: String
 * data: Object
 * callback: function
 * type: string[xml, html, script, json, text, _default]
 */

/*
 *<app>
 * <id></id>
 * <category></category>
 * <name></name>
 * <version></version>
 * <path></path>
 * <icon></icon>
 * <comment></comment>
 *</app>";
 */

alert(' ' + id + " " + count);
$("#timer").ajaxStart(function() {
	/*wait*/
//	while(id < count - 1) {
//		$(this).find(".bar").css({width:(id * 0.01/count) });
//		alert(" " + id + " " + count);
//	}
});

$("#timer").ajaxStop(function() {
	/*remove wait*/
	$(this).css({display: 'none'}).find(".progress").remove();
});


$(document).ready(function(){
	var category = null;
	var name = null;
	var version = null;
	var path = null;
	var icon = null;
	var comment = null;
	var container = $("#apps");
	var newApp = null;
	$.ajax({
		url:"./backend/server.php",
		type: "POST",
		dataType: "xml",
		success:function(data, textStatus){
					alert("here");
					count = parseInt($(data).find("count").text(), 10);
					$(data).find("app").each(function(){
						
						id = parseInt($(this).find("icon").text(), 10);
						category = $(this).find("category").text();
						icon = $(this).find("icon").text();
						name = $(this).find("name").text();
						newApp = '<div class="app unsync '+ category +'"><img src="'+ icon +'" alt="'+ name +'"><h6 class="name">'+ name +'</h6></div>';
						$container.isotope('insert', $(newApp));
					});
				}, 
		complete: function(XMLHttpRequest, textStatus) {
			$.getScript('js/main.js');
			return false;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert("Ajax Request Error!" + textStatus);
				}
		});		
});