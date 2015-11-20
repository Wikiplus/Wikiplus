<!DOCTYPE html>
<html>
<head>
	<title><?php echo getConfig('sitename');?></title>
	<meta charset="utf-8" />
	<link rel="stylesheet" href="<?php echo SR('css/material.min.css');?>">
	<link rel="stylesheet" type="text/css" href="<?php echo SR('css/statistics.css');?>">
	<script src="<?php echo SR('js/jquery.js');?>"></script>
	<script src="<?php echo SR('js/material.min.js');?>"></script>
	<script src="http://echarts.baidu.com/build/dist/echarts.js"></script>
	<script src="<?php echo SR('js/statistics.js');?>"></script>
</head>
<body>
	<div class="mdl-grid">
		<div class="mdl-cell mdl-cell--1-col"></div>
		<div class="mdl-cell mdl-cell--10-col">
			<div class="Headline">
				<h2>数据统计</h2>
			</div>
			<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate progress-demo process-bar" id="process-bar-main"></div>
			<div id="first-statistics">
				<h3>最近30日平均提交时间统计</h3>
				<div id="RecentUseTime"></div>
			</div>
			<div class="mdl-grid" id="meta-statistics">
				<div class="mdl-cell mdl-cell--12-col">
					<h3>概览</h3>
					<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate progress-demo process-bar" id="process-bar-site-ranking"></div>
					<div id="site-ranking"></div>
				</div>
			</div>
			<div class="mdl-grid" id="second-statistics">
				<div class="mdl-cell mdl-cell--6-col">
					<h3>最近贡献排行</h3>
					<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate progress-demo process-bar" id="process-bar-contribution-ranking"></div>
					<div id="contribution-raking"></div>
				</div>
				<div class="mdl-cell mdl-cell--6-col">
					<h3>热点页面</h3>
					<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate progress-demo process-bar" id="process-bar-hotpage-ranking"></div>
					<div id="hotpage-ranking"></div>
				</div>
			</div>
		</div>
		<div class="mdl-cell mdl-cell--1-col"></div>
	</div>
</body>
</html>