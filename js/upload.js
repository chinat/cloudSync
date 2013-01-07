/*
 * upload .js
 * this file is used to upload the system data to backend
 * called by user click
 * this upload these data:
 * the apps' name whose state changed
 * all the apps with their stat.
 *
 */


$("#submit button").click(function() {


    var remove = '[', add = '[';
    $(".changed").parent().each(function(){ 
	if($(this).hasClass('unsync'))
            remove += $(this).find('.name').text() + ",";
        else 
	    add += $(this).find('.name').text() + ',';
    });
    remove = (remove.length < 2 ? '' : remove.substring(0, remove.length - 1)) + ']';
    add = (add.length < 2 ? '' : add.substring(0, add.length - 1)) + ']';

    var upload_data = '[', sync = '[';
    $(".app").each(function() {
	if($(this).hasClass('unsync'))
            upload_data += '{ name:' + $(this).find('.name').text() + ', flag:unsync},';
        else {
            upload_data += '{ name:' + $(this).find('.name').text() + ', flag:sync},';
	    sync += $(this).find('.name').text() + ',';
	}
    });
    upload_data = (upload_data.length < 2 ? '' : upload_data.substring(0, upload_data.length - 1)) + ']';
    sync = (sync.length < 2 ? '' : sync.substring(0, sync.length - 1)) + ']';

    $.ajax({
        url: "/",
	type: "POST",
	data: '{add:' + add + ', remove:' + remove + ', apps:' + upload_data + ', sync:' + sync + '}',
	dataType: "json",
	success: function(data, textStatus) {
	    alert("Succeed " + data);
	},
	error: function(XMLHttpRequest, texStatus, errorThrown) {
	    alert("Sync Failed");
	}
    }); 
});
