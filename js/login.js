/*
 * this script is used to init user login ui
 * and used to submit user param
 * and used to load the working ui
 */

var appPath = 'apps.xml';
var selector = '.app';
var sync = '.unsync';

$container = $("#apps");
/**
  * this is a filter conbian search nav and state
  */
function filter() {
    var search = $.trim($("#search input").val());
    if(search === "") { 
	$container.isotope({filter: selector+sync});
    }
    else 
        $container.isotope({filter:selector + ":Contains(" + search + ")" + sync + ":Contains(" + search + ")" });
    if($("#btn-sort-asc").hasClass("active")) $container.isotope({sortBy: 'name', sortAscending: true});
    if($("#btn-sort-desc").hasClass("active")) $container.isotope({sortBy: 'name', sortAscending: false});
}

var localStorage = null;
var name = null;
var password = null;

if(window.localStorage){
    localStorage = window.localStorage;
    name = localStorage.getItem("name");
    password = localStorage.getItem("password");
}
if(localStorage != null &&  name != null && password != null)  {
    $("#front p").text("登录中...");
    $("#front").show();
    $.ajax({
        url:"/login",
        type:"POST",
        data: {name:name, password: password},
        dataType: "text",
        success: function(data, textStatus) {
	        if(data == "success") {
                /* load the orign page */
	            $("#login").hide();
	            $("#body").show();
	            load();
		    preSend();
	        }
	        else {
	            localStorage.removeItem("name");
	            localStorage.removeItem("password");
	        }
                $("#front").hide();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            localStorage.clear();
            $("#front").hide();
        }
    });
}

$(document).ready(function(){
    /*list for the submit button */
    $("#login-submit").click(function(){
	/* validate user input */
	$("#login-submit").attr('disabled', true);
        $("#front p").text("登录中...");
        $("#front").show();
	if($("#login-name").val() == "" || $("#login-password").val() == "") {
	    $(".warning").text("用户名或密码不能为空...").css({color: 'red'});
	    $("#login-submit").attr('disabled', false);
            $("#front").hide();
	    return false;
	}
	/* submit users input */
        $.ajax({
	        url:"/login",
	        type:"POST",
	        data: {name:$("#login-name").val(), password: $("#login-password").val()},
	        dataType: "text",
	        success: function(data, textStatus) {
		    if(data == "success") {
                    /* load the orign page */
                        if(localStorage != null) {
                            localStorage.setItem("name", $("#login-name").val());
                            localStorage.setItem("password", $("#login-password").val());
                        }
                        $("#front").hide();
		        $("#login").hide();
		        $("#body").show();
		        load();
			preSend();
		    }
		    else {
		        $(".warning").text("用户名或密码无效...").css({color: "red"});
                        $("#front").hide();
	                $("#login-submit").attr('disabled', false);
		    }
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
		    $(".warning").text("网络异常...").css({color: "red"});
                    $("#front").hide();
	            $("#login-submit").attr('disabled', false);
	        }
	    });
    });
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
    sync = '.unsync';
    filter();
});
    
$("#btn-synced").click(function(){
    if($(this).hasClass("active"))
       return false;
    sync = '.sync';
    filter();
});
    
    /* navigate */
$("#filters li").click(function() {
    selector = $(this).attr("data-filter");
    filter();
    return true; 
});

/* search */
$("#search input").keyup(function(event){
    var search = $.trim($(this).val());
    if(search === "") { 
	$container.isotope({filter: selector+sync});
    }
    else 
        $container.isotope({filter:selector + ":Contains(" + search + ")" + sync + ":Contains(" + search + ")" });
});
