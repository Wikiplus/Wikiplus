// 路径配置
$(document).ready(function () {

	var siteName = location.hash.slice(1);
	$('.Headline h2').text('数据统计 于 ' + siteName);

	$.ajax({
		url : 'data.php',
		type : 'GET',
		dataType : 'json',
		data : {'action' : 'meta', 'sitename' : siteName},
		success : function(data){
			if (data && data.editcount){
				$('.Headline h2').after(
					$('<h5>').text('共 ' + data.editcount + ' 次编辑于 ' + siteName)
				);
			}
			else{
				$('.Headline h2').after(
					$('<h5>').text('您查找的Wiki无人使用Wikiplus')
				);
				$('#p2').fadeOut('slow',function(){
					$(this).remove();
				})
			}
		}
	})
	/*
	require.config({
		paths: {
			echarts: 'http://echarts.baidu.com/build/dist'
		}
	});

	require([
		'echarts',
		'echarts/chart/line'
	], function (ec) {
			var myChart = ec.init(document.getElementById('RecentUseTime'));
			var option = {
				title: {
					text: '最近一周平均编辑提交时间',
					subtext: '纯属虚构'
				},
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: ['时延']
				},
				toolbox: {
					show: true,
					feature: {
						mark: { show: true },
						dataView: { show: true, readOnly: true },
						magicType: { show: false },
						restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				calculable: false,
				xAxis: [
					{
						type: 'category',
						boundaryGap: false,
						data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
					}
				],
				yAxis: [
					{
						type: 'value',
						axisLabel: {
							formatter: '{value} ms'
						}
					}
				],
				series: [
					{
						name: '时延',
						type: 'line',
						data: [3301, 4019, 1824, 4219, 4444, 5019, 7190],
						markPoint: {
							data: [
								{ type: 'max', name: '最大值' },
								{ type: 'min', name: '最小值' }
							]
						},
						markLine: {
							data: [
								{ type: 'average', name: '平均值' }
							]
						}
					}
				]
			};

			myChart.setOption(option);
		})
*/
});