<?php
class IndexController extends Controller{
	public function index(){
		$assign['title'] = "Wikiplus数据统计";
		return $this->display($assign, 'view');
	}
	public function rank(){
		$assign['title'] = "Wikiplus数据统计";
		return $this->display($assign, 'rank');
	}
}