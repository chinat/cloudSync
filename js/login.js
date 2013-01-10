/*
 * this script is used to init user login ui
 * and used to submit user param
 * and used to load the working ui
 */


$(document).ready(function(){
    /*list for the submit button */
    $("#login-submit").click(function(){
	/* validate user input */
	$("#login-submit").attr('disabled', true);
	if($("#login-name").val() == "" || $("#login-password").val() == "") {
	    $(".warning").text("用户名或密码不能为空...").css({color: 'red'});
	    $("#login-submit").attr('disabled', false);
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
		    $("#login").hide();
		    $("#body").show();
		    $.getScript("js/main.js");
		}
		else {
		    $(".warning").text("用户名或密码无效...").css({color: "red"});
	            $("#login-submit").attr('disabled', false);
		}
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
		$(".warning").text("网络异常...").css({color: "red"});
	        $("#login-submit").attr('disabled', false);
	    }
	});
    });
    $("#login-submit").attr('disabled', false);
});
