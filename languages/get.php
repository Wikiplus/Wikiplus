<?php
//gzip prepare
if(preg_match('/gzip/',$_SERVER['HTTP_ACCEPT_ENCODING'])){
	ob_start('ob_gzhandler');
}else{
	ob_start();
}
//add headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/javascript');

echo checkAndreturn();
ob_flush();

	
function checkAndreturn(){
	if (isset($_GET['lang'])){
		$language = $_GET['lang'];
		if (preg_match("/^[0-9a-z\-]+$/i",$language)){
			return findLangFile($language);
		}
		else{
			return "?";
		}
	}else{
		return "?";
	}
}

function findLangFile($language){
	$langJson = file_get_contents('./' . $language . '.json');
	if($langJson === FALSE){
		return "?";
	}
	$langHash = md5($langJson);
	if(isset($_SERVER['HTTP_IF_NONE_MATCH']) && $langHash == $_SERVER['HTTP_IF_NONE_MATCH']){
		header('Etag: '.$langHash, true, 304);
		return "";
	}else{
		header('Etag: '.$langHash);
		return $langJson;
	}
}

?>