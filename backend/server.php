<?php
 header ('Content-Type:text/xml;charset=UTF-8');
/*
 * this is only an example which used to test the UI it's job mainly includes
 * get the frontends request[post] analyze the system's filesystem and get the
 * softwares that installed do respose to the frontend
 */
     
/*analyze the filesystem 
 * here just read the icons in img/apps and get the names of them 
 */
$category = array('internet', 'multimedia', 'office', 'game', 'picture', 'development', 'system', 'accessory', 'other');
$index = 0;
$count = 0;
 
 

$path = "../img/apps/";
$handle = NULL;
echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<apps>';
if (is_dir ( $path )) {
	$count = sizeof(scandir($path)) - 2;
	//echo ($count > 2) ? $count - 2:0;
	echo '<count>'.$count.'</count>';
	$count = 0;
	$handle = opendir ( $path );
	if ($handle) {
		while ( ($file = readdir ( $handle )) != false ) {
			if ($file != "." && $file != "..") {
				echo "
					<app>
						<id>".$count ++."</id>
						<category>".$category [($index++) % count($category)]."</category>
						<name>".str_replace(strrchr($file, ".") , "", $file)."</name>
						<version>1.0</version>
						<path>img/apps/".$file."</path>
						<icon>img/apps/".$file."</icon>
						<comment>$file</comment>
					</app>";
			}
		}
	}
}
echo '</apps>';
?>