$(document).ready(function() {
    var appPath = 'apps.xml';
    var selector = '.app';
    var sync = '.unsync';
    $container = $("#apps");
    $("#apps").load(appPath, function(){
        count = $container.children('div').length; 
        btnSynced = $(".app:not(.unsync)").length;
        updateSync(btnSynced, count - btnSynced);
        
        /* disable right menu */
        $("img").bind("contextmenu", function(event){ return false; });
        $container.isotope({
            itemSelector: '.app' , 
            layoutMode: 'fitRows',
            getSortData : {
                name: function($element) {
                    return $element.find('.name').text();        
             }
          }});	
        
        /* double left click*/
        $("img").dblclick(function(){
            if($(this).parent().hasClass('unsync')) {
                $(this).parent().removeClass("unsync").addClass("sync");
                $container. isotope({filter:'.unsync' + selector});
                btnSynced ++;
	    }
            else if($(this).parent().hasClass('sync')) {
                $(this).parent().removeClass("sync").addClass("unsync");
                $container. isotope({filter:'.sync'  + selector});
                btnSynced --;
            }
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
        /*init */
        $container.isotope({filter: '.unsync', sortBy: 'random'});
    });

    /*sort */
    /*asc */
    $("#btn-sort-asc").click(function() {
        $container.isotope({sortBy: 'name', sortAscending: true});
    });
    /*desc*/
    $("#btn-sort-desc").click(function() {
        $container.isotope({sortBy: 'name', sortAscending: false});
    });

    /*synce */
    $("#btn-unsynced").click(function(){
        if($(this).hasClass("active"))
            return false;
        $container. isotope({filter:'.unsync'+selector});
        sync = '.unsync';
    });
    
    $("#btn-synced").click(function(){
        if($(this).hasClass("active"))
            return false;
        $container.isotope({filter:'.sync'+selector});
        sync = '.sync';
    });
    
    /* navigate */
    $("#filters li").click(function() {
        selector = $(this).attr("data-filter");
        $container.isotope({filter: selector + sync});
        return true; 
    });
    
});
