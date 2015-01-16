// JavaScript Document

var searcher = (function() {
	var yearParms = $("#yearSelect").val().split("_");
	var year = yearParms[0];
	var timeFrame = yearParms[1];
	return {
		type:"dataset",
		universe:$("input[name='dataset'][type='radio']:checked").val(),
		year:year,
		timeFrame:timeFrame
	}
})();

$(".search_btn").click(function() {
	if ($(this).attr("id")=="search_dataset") searcher.type="dataset";
	else if ($(this).attr("id")=="search_denominator") searcher.type="denominator";
	searcher.universe = $("input[name='"+searcher.type+"'][type='radio']:checked").val();
	for (var c in searcher) {
		$("#search span." + c).html(searcher[c]);	
	}
	$("#search_container").show();

});

$("#search_cancel").click(function() {
	$("#search_container").hide();
});

$("#yearSelect").change(function() {
	var yearParms = $(this).val().split("_");
	searcher.year = yearParms[0];
	searcher.timeFrame = yearParms[1];
	console.log(searcher);
	if (searcher.year < 2012) {
		$("input.universePicker[value='summary']").prop("checked",true);
		$("input.universePicker").prop("disabled",true);	
	} else {
		$("input.universePicker").prop("disabled",false);
	}
});

$("#search_go").click(function() {
	$("#search table").remove();
	var searchTerms = $("#search_term").val().replace(/[^A-Za-z0-9 _]/g,'');
	searchTerms = searchTerms.replace(/ /g,"%20");
	var request_url = "search.php?search=" + searchTerms + "&universe=" + searcher.universe + "&year=" + searcher.year + "&timeframe=" + searcher.timeFrame;
	console.log(request_url);
	$.getJSON(request_url,null,function(d) {
		var table = $("<table cellspacing='0'></table>"),tr,td;
		for (var var_id in d) {
			tr = $("<tr></tr>");
			tr.append($("<td><a class='search_id' href='#'>Use</a></td>"));
			tr.append($("<td>"+var_id+"</td>"));
			tr.append($("<td>"+d[var_id]["label"] + "</td>"));
			tr.append($("<td>"+d[var_id]["concept"] + "</td>"));
			table.append(tr); 
		}
		$("#table_container").append(table);
	});
});

$("#search").on("click","a.search_id",function() {
	var var_id = $(this).parents("td").next("td").text();
	var label = $(this).parents("td").next("td").next("td").text();
	$("#" + searcher.type).val(var_id);
	$("#" + searcher.type + "_label").text(label);
	$("#search_container").hide();
});