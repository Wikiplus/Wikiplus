<?php
/**
* Wikiplus 数据分析系统
*/

header('content-type;text/html;charset=utf-8');

//数据库信息定义

$DB_Host     = 'localhost';
$DB_Name     = 'wikiplus';
$DB_UserName = 'root';
$DB_UserPass = '';

/*

$DB_Host     = 'localhost';
$DB_Name     = MYSQL_DATABASE;
$DB_UserName = MYSQL_USERNAME;
$DB_UserPass = MYSQL_PASSWORD;

*/

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

if (isValid(array('action'))){
	//数据操作

	//按流程 先判断这个站是否存在
	$mysqli = new mysqli($DB_Host,$DB_UserName,$DB_UserPass,$DB_Name);
	$mysqli->set_charset("utf8");

	$action = escapeParameters(array('action'),$mysqli)['action'];

	if ($action == 'meta'){
		if (isValid(array('sitename'))){
			$siteName = escapeParameters(array('sitename'),$mysqli)['sitename'];
			$query = "SELECT count(*) FROM `wikiplus_statistics` WHERE `wikiname` = '$siteName'";
			$res = $mysqli->query($query)->fetch_all();
			if ($res[0][0] > 0){
				$json = array(
					'sitename' => $siteName,
					'editcount' => $res[0][0]
				);
				exit(json_encode($json));
			}
			else{
				$json = array(
					'sitename' => $siteName
				);
				exit(json_encode($json));
			}
		}
	}
	elseif ($action == 'recentusetime') {

		if (isValid(array('sitename'))){
			$siteName = escapeParameters(array('sitename'),$mysqli)['sitename'];
			$fromDate = date('Y') . '-' . date('m') . '-' . date('d') . ' 00:00:00';
			$query = "SELECT * FROM `wikiplus_statistics` WHERE `wikiname` = '$siteName' AND `timestamp` >= '$fromDate'";
			$res = $mysqli->query($query)->fetch_all();
			if (count($res) > 0){
				//存在该wiki 开始计算时间
			}
			else{
				$json = array(
					'sitename' => $siteName,
				);
				exit(json_encode($json));
			}
		}
	}
	else{
		exit();
	}
}
?>