<!DOCTYPE html>
<html>
<head>
	<title><?php echo getConfig('sitename');?></title>
	<meta charset="utf-8" />
	<link rel="stylesheet" href="<?php echo SR('css/material.min.css');?>">
	<link rel="stylesheet" type="text/css" href="<?php echo SR('css/statistics.css');?>">
	<script src="<?php echo SR('js/jquery.js');?>"></script>
	<script src="<?php echo SR('js/material.min.js');?>"></script>
	<script src="<?php echo SR('js/statistics_rank.js');?>"></script>
	<style type="text/css">
		table{
			width: 100%;
		}
	</style>
</head>
<body>
	<div class="mdl-grid">
	<div class="mdl-cell mdl-cell--1-col"></div>
	<div class="mdl-cell mdl-cell--10-col">
		<div class="Headline">
			<h2>数据统计</h2>
		</div>
		<div class="mdl-grid" id="time-statistics">
			<div class="mdl-cell mdl-cell--12-col">
				<h3>最长编辑时间</h3>
				<div class="longest">
				</div>
			</div>
			<div class="mdl-cell mdl-cell--12-col">
				<h3>最短编辑时间</h3>
				<div class="shortest">
				</div>
			</div>
		</div>
	</div>
	<div class="mdl-cell mdl-cell--1-col"></div>
	</div>
</body>