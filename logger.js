// JavaScript Document

var logger = function(id) {
	this.logDOM = $("#"+id);
	this.log = function(toLog) {
		var theString;
		if (typeof(toLog)==="object") {
			theString = JSON.stringify(toLog,null,2);
		} else {
			theString = toLog;	
		}
		this.logDOM.html(this.logDOM.html() + theString + "<br>");
	};
};


