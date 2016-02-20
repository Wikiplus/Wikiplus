// 路径配置
$(document).ready(function () {
	var showRecentUseTime = function (useTime) {
		var useTimeDate = [];
		var useTimeTime = [];
		for (var key in useTime) {
			useTimeDate.push(key);
			useTimeTime.push(useTime[key]);
		}

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
					text: '最近30日平均编辑提交时间',
					subtext: '不是虚构'
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
						data: useTimeDate
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
						data: useTimeTime,
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
	}

	//主体开始
	var siteName = location.hash.slice(1);
	// 监听URL Hash 变化
	window.onhashchange = function () {
		location.reload();
	}
	//创建表格
	var initTable = function (container, titles) {
		container.append(
			$('<table>').addClass('mdl-data-table').addClass('mdl-js-data-table').addClass('mdl-shadow--2dp')
			);
		container.find('table').append(
			$('<thead>').append('<tr>')
			);
		for (var item in titles) {
			container.find('table thead tr').append(
				$('<th>').addClass('mdl-data-table__cell--non-numeric').text(titles[item])
				);
		}
		container.find('table').append(
			$('<tbody>')
			)
		return container.find('table');
	}
	//为表格添加项目
	var addTableElement = function (table, values) {
		var tbody = table.find('tbody').last();
		tbody.append(
			$('<tr>')
			);
		for (var key in values) {
			tbody.find('tr').last().append(
				$('<td>').addClass('mdl-data-table__cell--non-numeric').text(values[key])
				);
		}
	}


	if (siteName) {
		$('.Headline h2').text('数据统计 于 ' + siteName);

		$.ajax({
			url: 'api/meta',
			type: 'GET',
			dataType: 'json',
			data: { 'sitename': siteName },
			success: function (data) {
				if (data && data.editcount) {
					$('.Headline h2').after(
						$('<h5>').text('共 ' + data.editcount + ' 次编辑于 ' + siteName)
						);

					//该站存在 加载统计页面

					$('#first-statistics,#second-statistics').fadeIn('slow');
					$('#second-statistics').css('display', 'flex');

					//查询最近平均更改时间

					$.ajax({
						url: 'api/recentavgtime',
						type: 'GET',
						dataType: "json",
						data: { 'sitename': siteName },
						success: function (data) {
							if (data.usetime) {
								showRecentUseTime(data.usetime);
								$('#process-bar-main').fadeOut('slow', function () {
									$(this).remove();
								})
							}
							else {
								console.log('ERROR');
							}
						}
					});

					$.ajax({
						url: 'api/ranking',
						type: "GET",
						dataType: "json",
						data: { 'sitename': siteName },
						success: function (data) {
							if (data.contributionRanking) {
								var container = initTable($('#contribution-raking'), ['用户名', '编辑次数']);

								for (var key in data.contributionRanking) {
									addTableElement(container, [
										key,
										data.contributionRanking[key]
									]);
								}

								$('#process-bar-contribution-ranking').fadeOut('slow', function () {
									$(this).remove();
								})
							}
							if (data.hotpageRanking) {
								container = initTable($('#hotpage-ranking'), ['页面名', '编辑次数']);
								for (key in data.hotpageRanking) {
									addTableElement(container, [
										key,
										data.hotpageRanking[key]
									]);
								}
								$('#process-bar-hotpage-ranking').fadeOut('slow', function () {
									$(this).remove();
								})
							}
						}
					})
				}
				else {
					$('.Headline h2').after(
						$('<h5>').text('您查找的Wiki无人使用Wikiplus')
						);
					$('#process-bar-main').fadeOut('slow', function () {
						$(this).remove();
					})
				}
			}
		})
	}
	else {
		$.ajax({
			url: 'api/meta',
			type: "GET",
			dataType: "json",
			success: function (data) {
				if (data.editcount) {
					$('.Headline h2').after(
						$('<h5>').html('当前Wikiplus共处理了 ' + data.editcount + ' 次编辑<br>请在页面地址后加“#站点名”来查看分站点统计')
						);
				}
				if (data.info) {
					$('#meta-statistics').fadeIn('slow', function () {
						var tbody = initTable($('#site-ranking'), ['站点名','编辑次数']);
						for (var key in data.info) {
							addTableElement(tbody, [
								key,
								data.info[key]
							]);
						}
						$('#process-bar-site-ranking').fadeOut('slow',function(){
							$(this).remove();
						})
					})
				}
			}
		});

		$('#process-bar-main').fadeOut('slow', function () {
			$(this).remove();
		})
	}
    $.ajax({
        url : 'api/trend',
        type : "GET",
        dataType : "json",
        data : {
          'sitename' : siteName ? siteName : ''
        },
        success : function(data){
            if (data){
                var days = [];
                var counts = [];
                for (var day in data){
                    // 哪个傻逼写的接口 丑飞了
                    for (var key in data[day]){
                        days.push(key);
                        counts.push("" + data[day][key]);
                    }
                }
                $('#meta-statistics-trend').fadeIn('slow',function(){
                    require.config({
                        paths: {
                            echarts: 'http://echarts.baidu.com/build/dist'
                        }
                    });

                    require([
                        'echarts',
                        'echarts/chart/line'
                    ], function (ec) {
                        var myChart = ec.init(document.getElementById('trend'));
                        var option = {
                            title: {
                                text: siteName ? 'Wikiplus过去一年编辑提交次数趋势 于 ' + siteName : 'Wikiplus过去一年编辑提交次数趋势 于 总体',
                                subtext: '不是虚构'
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['编辑次数']
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
                                    data: days
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    axisLabel: {
                                        formatter: '{value}'
                                    }
                                }
                            ],
                            series: [
                                {
                                    name: '编辑次数',
                                    type: 'line',
                                    data: counts
                                    //markPoint: {
                                    //    data: [
                                    //        { type: 'max', name: '最大值' },
                                    //        { type: 'min', name: '最小值' }
                                    //    ]
                                    //},
                                    //markLine: {
                                    //    data: [
                                    //        { type: 'average', name: '平均值' }
                                    //    ]
                                    //}
                                }
                            ]
                        };

                        myChart.setOption(option);
                    })
                });

                $('#process-bar-trend').fadeOut('slow',function(){
                    $(this).remove();
                })
            }
        }
    })


});