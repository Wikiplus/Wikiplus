<?php
header('Access-Control-Allow-Origin: *');
if (isset($_GET['lang'])){
	$language = $_GET['lang'];
	if (preg_match("/^[0-9a-z\-]+$/i",$language)){
		echo file_get_contents('./' . $language . '.json');
	}
	else{
		die('?');
	}
}
?>