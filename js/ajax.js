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
$(document).ready(function(){
    var opts = {
      lines: 13, // The number of lines to draw
      length: 7, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent in px
      left: '50%', // Left position relative to parent in px
    };
    var spinner = new Spinner().spin();
    //$("#timer").append($(spinner.el));
    
    $("#timer").ajaxStart(function() {
        $("#timer").append($(spinner.el));
    });
    
    $("#timer").ajaxStop(function() {
    	/*remove wait*/
    	$(this).css({display: 'none'}).find(".progress").empty();
    	spinner.stop();
    });    
    
    
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
					count = parseInt($(data).find("count").text(), 10);
					updateSync(0, count);
					$(data).find("app").each(function(){
						id = parseInt($(this).find("id").text(), 10);
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