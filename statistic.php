<?php
/**
* Wikiplus 数据收集和统计系统
*/

header('Access-Control-Allow-Origin : *');//允许跨域

//数据库信息定义
/*
$DB_Host     = 'localhost';
$DB_Name     = 'wikiplus';
$DB_UserName = 'root';
$DB_UserPass = '';
*/

$DB_Host     = 'localhost';
$DB_Name     = MYSQL_DATABASE;
$DB_UserName = MYSQL_USERNAME;
$DB_UserPass = MYSQL_PASSWORD;

//验证提交数据有效性
function isValid($array){
	foreach ($array as $value) {
		if (!isset($_GET[$value]) || empty($_GET[$value])){
			return false;
		}
	}
	return true;
}

//转义提交数据
function escapeParameters($params,$mysqli){
	$paramsArray = array();
	foreach ($params as $value) {
		$paramsArray[$value] = mysqli_real_escape_string($mysqli,$_GET[$value]);
	}
	return $paramsArray;
}
if (isValid(array('wikiname','username','usetime','pagename'))){
	//连接数据库
	$mysqli = new mysqli($DB_Host,$DB_UserName,$DB_UserPass,$DB_Name);
	$params = escapeParameters(array('wikiname','username','usetime','pagename'),$mysqli);

	$wikiname = $params['wikiname'];
	$username = $params['username'];
	$usetime  = (int)$params['usetime'];
	$pagename = $params['pagename'];

	$query = "INSERT INTO wikiplus_statistics (wikiname,username,usetime,pagename) VALUES ('$wikiname','$username',$usetime,'$pagename')";
	$res = $mysqli->query($query);
	if ($res){
		echo '{"result":"success"}';
	}
}
?>