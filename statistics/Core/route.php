<?php
// 本页面定义路由规则。规则从上到下解析。
// 例子： "正则表达式" => "控制器名/方法名"
// 捕获到的内容会作为参数顺次传入方法中。
return array(
	'^$' => 'Index/index',
	'^rank$' => 'Index/rank',
	
	'^api/meta$' => 'Data/meta',
	'^api/recentavgtime' => 'Data/recentAvgTime',
	'^api/ranking' => 'Data/ranking',
	'^api/weekly' => 'Data/weekly',
	'^api/timerank' => 'Data/timeRank',
	'^api/submit' => 'Submit/submit',
	
	//固定路由 放在这条线上面
	//=====================================
	//带参数路由 放在这条线下面
);