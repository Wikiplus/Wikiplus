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
		}else{
			$query = "SELECT count(*) FROM `wikiplus_statistics`";
			$res = $mysqli->query($query);
			if ($res){
				$json = array(
					'editcount' => $res->fetch_row()[0]
				);
				exit(json_encode($json));
			}
		}
	}
	elseif ($action == 'recentusetime') {

		if (isValid(array('sitename'))){
			$siteName = escapeParameters(array('sitename'),$mysqli)['sitename'];
			$timestamp = strtotime('-7 days',strtotime('today'));
			$fromDate = date('Y-m-d',$timestamp) . ' 00:00:00';
			$query = "SELECT * FROM `wikiplus_statistics` WHERE `wikiname` = '$siteName' AND `timestamp` >= '$fromDate'";
			$res = $mysqli->query($query)->fetch_all(MYSQLI_ASSOC);
			if (count($res) > 0){
				$usetime = array();
				$editcount = array();
				foreach ($res as $item) {
					$editDate = substr($item['timestamp'], 0, 10);
					if (isset($usetime[$editDate])){
						$usetime[$editDate] = $usetime[$editDate] + $item['usetime'];
						$editcount[$editDate] = $editcount[$editDate] + 1;
					}
					else{
						$usetime[$editDate] = $item['usetime'];
						$editcount[$editDate] = 1;
					}
				}
				foreach ($usetime as $key => &$value) {
					$value = (int)($value / $editcount[$key]);
				}
				$json = array(
					'sitename' => $siteName,
					'usetime' => $usetime
				);
				exit(json_encode($json));
			}
			else{
				$json = array(
					'sitename' => $siteName,
				);
				exit(json_encode($json));
			}
		}
	}
	elseif ($action == 'ranking'){
		if (isValid(array('sitename'))){
			$siteName = escapeParameters(array('sitename'),$mysqli)['sitename'];
			$timestamp = strtotime('-7 days',strtotime('today'));
			$fromDate = date('Y-m-d',$timestamp) . ' 00:00:00';
			$query = "SELECT * FROM `wikiplus_statistics` WHERE `wikiname` = '$siteName' AND `timestamp` >= '$fromDate'";
			$res = $mysqli->query($query)->fetch_all(MYSQLI_ASSOC);

			if (count($res) > 0){
				//开始处理数据
				$contributionRanking = array();
				$hotpageRanking = array();

				foreach ($res as $item) {
					if (isset($contributionRanking[$item['username']])){
						$contributionRanking[$item['username']] = $contributionRanking[$item['username']] + 1;
					}
					else{
						$contributionRanking[$item['username']] = 1;
					}
					if (isset($hotpageRanking[$item['pagename']])){
						$hotpageRanking[$item['pagename']] = $hotpageRanking[$item['pagename']] + 1;
					}
					else{
						$hotpageRanking[$item['pagename']] = 1;
					}

				}
				arsort($contributionRanking);
				arsort($hotpageRanking);

				$contributionRanking = array_slice($contributionRanking, 0, 20);
				$hotpageRanking = array_slice($hotpageRanking, 0, 20);

				$json = array(
					'sitename' => $siteName,
					'contributionRanking' => $contributionRanking,
					'hotpageRanking' => $hotpageRanking
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
	elseif ($action == 'weekly'){
		if (isValid(array('sitename'))){
			$siteName = escapeParameters(array('sitename'),$mysqli)['sitename'];
			$timestamp = strtotime('-7 days',strtotime('today'));
			$fromDate = date('Y-m-d',$timestamp) . ' 00:00:00';
			$query = "SELECT * FROM `wikiplus_statistics` WHERE `wikiname` = '$siteName' AND `timestamp` >= '$fromDate'";
			$res = $mysqli->query($query)->fetch_all(MYSQLI_ASSOC);

			if (count($res) > 0){
				$average = 0;
				foreach ($res as $item) {
					$average += $item['usetime'];
				}

				$average = $average / count($res);

				$json = array(
					'sitename' => $siteName,
					'editcount' => count($res),
					'average' => $average
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