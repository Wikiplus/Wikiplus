<?php
/* Wikiplus Feedback System */
$DB_Host     = 'localhost';
$DB_Name     = MYSQL_DATABASE;
$DB_UserName = MYSQL_USERNAME;
$DB_UserPass = MYSQL_PASSWORD;
echo 'Thanks for using Wikiplus. This is Wikiplus Feedback System.<br>';
if (!isset($_GET["data"])||empty($_GET["data"])){
	die('Wrong input format!');
}
$mysqli = new mysqli($DB_Host,$DB_UserName,$DB_UserPass,$DB_Name);
$pagename    = mysqli_real_escape_string($mysqli,base64_encode($_GET["pagename"]));
$data        = mysqli_real_escape_string($mysqli,base64_encode($_GET["data"]));
$query = "INSERT INTO wikiplus_feedback (pagename,data) VALUES (\"$pagename\",\"$data\")";
$res = $mysqli->query($query);
if ($res){
	echo 'Your Feedback has recorded, Thanks.';
}
else{
	echo 'Failed.';
}
?>