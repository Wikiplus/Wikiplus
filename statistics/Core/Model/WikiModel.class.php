<?php
class WikiModel extends Model{
	function __construct(){
		parent::__construct("wikiplus_statistics");
	}
	
	//基础数据
	public function meta(){
		return $this->sql("SELECT `wikiname`, count(*) count FROM `wikiplus_statistics` GROUP BY `wikiname`")->select();
	}
	//按wiki区分的计数
	public function countBySite($sitename){
		$sitename = $this->F($sitename);
		return $this->sql("SELECT count(*) count FROM `wikiplus_statistics` WHERE `wikiname`=?", $sitename)->select();
	}
	//最近一段时间的平均提交时间
	public function recentAvgTime($sitename, $from){
		$sitename = $this->F($sitename);
		$fromDate = date('Y-m-d', $from);
		return $this->sql("SELECT date(`timestamp`) date, floor(AVG(`usetime`)) avgtime FROM `wikiplus_statistics` WHERE `wikiname`=? AND `timestamp`>=? GROUP BY date(`timestamp`)", $sitename, $fromDate)->select();
	}
	//最近一段时间的编辑者编辑次数
	public function contributorRank($sitename, $from){
		$sitename = $this->F($sitename);
		$fromDate = date('Y-m-d', $from);
		return $this->sql("SELECT `username`, count(`id`) count FROM `wikiplus_statistics` WHERE `wikiname`=? AND `timestamp`>=? GROUP BY `username` ORDER BY `count` DESC", $sitename, $fromDate)->select();
	}
	//最近一段时间的页面编辑次数
	public function hotpageRank($sitename, $from){
		$sitename = $this->F($sitename);
		$fromDate = date('Y-m-d', $from);
		return $this->sql("SELECT `pagename`, count(`id`) count FROM `wikiplus_statistics` WHERE `wikiname`=? AND `timestamp`>=? GROUP BY `pagename` ORDER BY `count` DESC", $sitename, $fromDate)->select();
	}
	//最近一段时间内基本信息
	public function metaInfo($sitename, $from){
		$fromDate = date('Y-m-d', $from);
		if(is_null($sitename)){
			return $this->sql("SELECT count(`id`) count, avg(`usetime`) avgtime FROM `wikiplus_statistics` WHERE `timestamp`>=?", $fromDate)->select();
		} else {
			$sitename = $this->F($sitename);
			return $this->sql("SELECT count(`id`) count, avg(`usetime`) avgtime FROM `wikiplus_statistics` WHERE `wikiname`=? AND `timestamp`>=?", $sitename, $fromDate)->select();
		}
	}
	//最长的编辑时间
	public function longestEdit($sitename, $limit){
		$limit = (int) $limit;
		if(is_null($sitename)){
			return $this->sql("SELECT * FROM `wikiplus_statistics` ORDER BY `usetime` DESC LIMIT $limit")->select();
		} else {
			$sitename = $this->F($sitename);
			return $this->sql("SELECT * FROM `wikiplus_statistics` WHERE `wikiname`=? ORDER BY `usetime` DESC LIMIT $limit", $sitename)->select();
		}
	}
	//最短的编辑时间
	public function shortestEdit($sitename, $limit){
		$limit = (int) $limit;
		if(is_null($sitename)){
			return $this->sql("SELECT * FROM `wikiplus_statistics` ORDER BY `usetime` ASC LIMIT $limit")->select();
		} else {
			$sitename = $this->F($sitename);
			return $this->sql("SELECT * FROM `wikiplus_statistics` WHERE `wikiname`=? ORDER BY `usetime` ASC LIMIT $limit", $sitename)->select();
		}
	}
	//提交数据
	public function submit($sitename, $username, $usetime, $pagename){
		$sitename = $this->F($sitename);
		$username = $this->F($username);
		$usetime = $this->F($usetime);
		$pagename = $this->F($pagename);
		
		return $this->sql("INSERT INTO `wikiplus_statistics` (`wikiname`, `username`, `usetime`, `pagename`) VALUES(?, ?, ?, ?)", $sitename, $username, $usetime, $pagename)->execute();
	}
}