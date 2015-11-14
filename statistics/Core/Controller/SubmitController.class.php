<?php
class SubmitController extends Controller{
	function __construct(){
		parent::__construct();
		header('Access-Control-Allow-Origin : *'); //允许跨域调用
	}
	public function submit(){
		$reqRet = $this->para_require(array(
			"wikiname",
			"username",
			"usetime",
			"pagename",
		), "POST");
		
		if(!$reqRet){
			return;
		}
		
		$usetime = intval($_POST['usetime'], 10);
		if($usetime <= 0 || $usetime > 3600000){
			return $this->ajaxReturn(array(
				"info" => "Field `usetime` is unlike a normal result. Um.... , Please do not submit directly.",
			), 400);
		}
		
		$wikiModel = new WikiModel();
		$ret = $wikiModel->submit($_POST['wikiname'], $_POST['username'], $usetime, $_POST['pagename']);
		if($ret){
			$this->ajaxReturn(array(
				"result" => "success",
			));
		} else {
			$this->ajaxReturn(array(
				"info" => "Statistics Database has a internal error.",
			), 500);
		}
	}
	private function para_require($paraArr, $method="GET"){
		if($method == "GET"){
			foreach($paraArr as $name){
				if(!isset($_GET[$name]) || empty($_GET[$name])){
					$this->ajaxReturn(array(
						"info" => "Parameter `".$name."` is required.",
					), 400);
					return false;
				}
			}
		} elseif ($method == "POST") {
			foreach($paraArr as $name){
				if(!isset($_POST[$name]) || empty($_POST[$name])){
					$this->ajaxReturn(array(
						"info" => "Parameter `".$name."` is required.",
					), 400);
					return false;
				}
			}
		} else {
			throw new Exception("不支持的method。");
		}
		return true;
	}
}