/*
 * upload .js
 * this file is used to upload the system data to backend
 * called by user click
 * this upload these data:
 * the apps' name whose state changed
 * all the apps with their stat.
 *
 */
var categories = new Array('internet', 'multimedia', 'office', 'game', 'picture', 'development', 'system', 'accessory', 'other');

$("#submit button").click(function() {
    $("#front").css({display: "block"});
    var remove = new Array(), add = new Array();
    var i = 0, j = 0, k;
    $(".changed").parent().each(function(){ 
	if($(this).hasClass('unsync'))
            remove[i++] = $(this).find('.name').text();
        else 
	    add[j++] = $(this).find('.name').text();
    });

    var upload_data = new Array(), sync = new Array();
    i = 0, j = 0;
    for(k = 0;k < categories.length; k++) {
        $("." + categories[k]).each(function() {
	    if($(this).hasClass('unsync'))
                upload_data[i++] = { name:$(this).find('.name').text(), flag:'unsync', category: categories[k]};
            else {
                upload_data[i++] = { name:$(this).find('.name').text(), flag:'sync', category: categories[k]};
	        sync[j++] = $(this).find('.name').text();
	    }
        });
    }

    $.ajax({
        url: "/",
	type: "POST",
	data: {add: add, remove: remove, apps: upload_data, sync: sync},
	dataType: "text",
	success: function(data, textStatus) {
	    if(data === "refresh") {
		    //window.location.reload();
		    $("#apps").empty();
            $("#front").css({display: "none"});
		    load();
		    submit();
	    }
	    return false;
	},
	error: function(XMLHttpRequest, texStatus, errorThrown) {
	    $("#front").css({display: "none"});
	    return false;
	}
    }); 
});
