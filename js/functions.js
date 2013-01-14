function updateSync(sync, unsync) {
    $("#btn-synced").text("已同步(" + sync + ")");
    $("#btn-unsynced").text("未同步(" + unsync + ")");
}

function submit() {
    if($(".app").children().hasClass("changed"))
        $("#submit").show();
    else 
        $("#submit").hide();
}

//new selector
jQuery.expr[':'].Contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase()
	.indexOf(m[3].toUpperCase()) >= 0;
};

//replace 
function load() {
    $('<div id="apps"></div>').load(appPath, function(){
        $container.replaceWith($(this));
        $container = $("#apps");
        $container.isotope({
            itemSelector: '.app' , 
            layoutMode: 'fitRows',
            getSortData : {
                name: function($element) {
                        return $element.find('.name').text();
                     }
                 }
       });
       filter();
       count = $container.children('div').length;
       btnSynced = $(".app:not(.unsync)").length;
       updateSync(btnSynced, count - btnSynced);
       
        /* disable right menu */
        /* double left click*/
        $("img").bind("contextmenu", function(event){ return false; })
        .dblclick(function(){
            if($(this).parent().hasClass('unsync')) {
                $(this).parent().removeClass("unsync").addClass("sync");
                btnSynced ++;
            }
            else if($(this).parent().hasClass('sync')) {
                $(this).parent().removeClass("sync").addClass("unsync");
                btnSynced --;
            }
            filter();
            updateSync(btnSynced, count - btnSynced);

            if($(this).hasClass('changed')) 
            $(this).removeClass('changed');
            else 
                $(this).addClass('changed');

            submit();
            return false;
        }).mousedown(function(event) {
            if(event.which == 3){
                alert("Right clicked");             
            }
            return false;
        });
    });
    return false;
}

function preSend() {
    var sync = new Array();
    var i = 0;
    $(".sync").each(function() {
        sync[i++] = $(this).find('name').text();
    });
    $.ajax({
	    url:"/watch",
	    type:"POST",
	    data: {sync:sync},
	    dataType:"text",
	    success: function(data, textStatus) {
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
	    }
    });	    
}
