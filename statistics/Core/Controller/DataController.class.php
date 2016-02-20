<?php
class DataController extends Controller {
	//基本信息
	public function meta(){
		$wikiModel = new WikiModel(); 
		
		if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
			//返回特定sitename的数目
			$res = $wikiModel->countBySite($_GET['sitename']);

			if($res){
				return $this->ajaxReturn(array(
					"editcount" => $res[0]['count'],
				));
			}else{
				return $this->ajaxReturn(array(), 204);
			}
		} else {
			//返回总体统计数目
			$res = $wikiModel->meta();
			$editcount = 0;
			$wikiinfo = array();
			if($res){
				foreach ($res as $row) {
					$editcount += $row['count'];
					$wikiinfo[$row['wikiname']] = $row['count'];
				}
			}
			return $this->ajaxReturn(array(
				"editcount" => $editcount,
				"info" => $wikiinfo,
			));
		}
	}

    /**
     * 趋势
     */
    public function trend(){
		$wikiModel = new WikiModel();
        if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
            $data = $wikiModel->getRecentEditCounts($_GET["sitename"], strtotime('-365 days', strtotime('today')));
            $result = [];
            $baseCount = $wikiModel->historyCount($_GET["sitename"], strtotime('-365 days', strtotime('today')))[0]['count'];
            foreach($data as $day){
                array_push($result, [
                    $day['date'] => $day['count'] + $baseCount
                ]);
                $baseCount += $day['count'];
            }
            $this->ajaxReturn($result);
        }
        else{
            $data = $wikiModel->getRecentEditCounts(null, strtotime('-365 days', strtotime('today')));
            $result = [];
            $baseCount = $wikiModel->historyCount(null, strtotime('-365 days', strtotime('today')))[0]['count'];
            foreach($data as $day){
                array_push($result, [
                    $day['date'] => $day['count'] + $baseCount
                ]);
                $baseCount += $day['count'];
            }
            $this->ajaxReturn($result);
        }
	}

	//最近平均编辑时间
	public function recentAvgTime(){
		if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
			$wikiModel = new WikiModel();
			$fromTime = strtotime('-30 days', strtotime('today'));
			$res = $wikiModel->recentAvgTime($_GET['sitename'], $fromTime);
			if($res){
				$usetimeArr = array();
				foreach ($res as $row) {
					$usetimeArr[$row['date']] = intval($row['avgtime'], 10);
				}
				return $this->ajaxReturn(array(
					"usetime" => $usetimeArr,
				));
			} else {
				return $this->ajaxReturn(array(), 204);
			}
		} else {
			return $this->ajaxReturn(array(
				"info" => "Parameter 'sitename' is required.",
			), 400);
		}
	}
	
	//返回排名
	public function ranking(){
		if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
			$wikiModel = new WikiModel();
			$fromTime = strtotime('-7 days', strtotime('today'));
			
			$contributorRes = $wikiModel->contributorRank($_GET['sitename'], $fromTime);
			$hotpageRes = $wikiModel->hotpageRank($_GET['sitename'], $fromTime);
			
			if($contributorRes || $hotpageRes){
				$contributionRanking = array();
				foreach($contributorRes as $row){
					$contributionRanking[$row['username']] = $row['count'];
				}
				$hotpageRanking = array();
				foreach($hotpageRes as $row){
					$hotpageRanking[$row['pagename']] = $row['count'];
				}
				
				$contributionRanking = array_slice($contributionRanking, 0, 20);
				$hotpageRanking = array_slice($hotpageRanking, 0, 20);
				return $this->ajaxReturn(array(
					"contributionRanking" => $contributionRanking,
					"hotpageRanking" => $hotpageRanking,
				));
			}else{
				return $this->ajaxReturn(array(), 204);
			}
		} else {
			return $this->ajaxReturn(array(
				"info" => "Parameter 'sitename' is required.",
			), 400);
		}
	}
	
	//一周内基本信息
	public function weekly(){
		if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
			$sitename = $_GET['sitename'];
		} else {
			$sitename = NULL;
		}
		
		$wikiModel = new WikiModel();
		$fromTime = strtotime('-7 days', strtotime('today'));
		$res = $wikiModel->metaInfo($sitename, $fromTime);
		if($res){
			return $this->ajaxReturn(array(
				"editcount" => $res[0]['count'],
				"average" => $res[0]['avgtime'],
				"sitename" => $sitename
			));
		} else {
			return $this->ajaxReturn(array(), 204);
		}
	}
	
	//最长时间/最短时间排名
	public function timeRank(){
		if(isset($_GET['sitename']) && $_GET['sitename'] != ""){
			$sitename = $_GET['sitename'];
		} else {
			$sitename = NULL;
		}
		
		$wikiModel = new WikiModel();
		$longestRes = $wikiModel->longestEdit($sitename, 10);
		$shortestRes = $wikiModel->shortestEdit($sitename, 10);
		
		if($longestRes || $shortestRes){
			return $this->ajaxReturn(array(
				"longest" => $longestRes,
				"shortest" => $shortestRes
			));
		} else {
			return $this->ajaxReturn(array(), 204);
		}
	}
}