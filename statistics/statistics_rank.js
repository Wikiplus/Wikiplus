$(document).ready(function(){
	var siteName = location.hash.slice(1);

	window.onhashchange = function(){
		location.reload();
	}
	//创建表格
	var initTable = function(container, titles){
		container.append(
			$('<table>').addClass('mdl-data-table').addClass('mdl-js-data-table').addClass('mdl-shadow--2dp')
		);
		container.find('table').append(
			$('<thead>').append('<tr>')
		);
		for (item in titles){
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
	var addTableElement = function(table, values){
		var tbody = table.find('tbody').last();
		tbody.append(
			$('<tr>')
		);
		for (k in values){
			tbody.find('tr').last().append(
				$('<td>').addClass('mdl-data-table__cell--non-numeric').text(values[k])
			);
		}
	}

		$.ajax({
			url : "data.php?action=rank",
			dataType : "json",
			data : {'sitename' : siteName},
			success : function(data){
				if (data.longest){
					var table = initTable($('.longest'), ['Wiki', '页面名', '用时', '用户名']);
					for (k in data.longest){
						addTableElement(table, [
							data.longest[k].wikiname,
							data.longest[k].pagename,
							data.longest[k].usetime,
							data.longest[k].username
						])
					}
				}
				if (data.shortest){
					var table = initTable($('.shortest'), ['Wiki', '页面名', '用时', '用户名']);
					for (k in data.shortest){
						addTableElement(table, [
							data.shortest[k].wikiname,
							data.shortest[k].pagename,
							data.shortest[k].usetime,
							data.shortest[k].username
						])
					}
				}
			}
		})
})