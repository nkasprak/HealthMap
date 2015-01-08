// JavaScript Document

var dataGrabber = function(key, url, model, requestList) {
	this.key = key;
	this.url = "http://api.census.gov/data/2013/acs1/profile/?";
	this.requestList = requestList;
	this.currentRequest = 0;
	this.makeRequest = function(requestString, callback) {
		var geturl = this.url + requestString + "&key=" + this.key;
		$.get(geturl, null, function(d) {
			callback(d);
		});
	};
	this.dataHandler = function(d,geography,dataset) {
		var populationHandler, insuranceHandler, pad = function (n, width) {
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
		};
		if (geography=="state") {
			populationHandler = function() {
				if (typeof(model.states)=="undefined") model.states = {};
				var stateObj = {};
				stateObj.population = d[i][1];
				stateObj.FIPS = d[i][2];	
				stateObj.counties = {};
				model.states[d[i][0]] = stateObj;
			};
			insuranceHandler = function() {
				stateObj = model.states[d[i][0]];
				stateObj.uninsured = d[i][1];
			};
		}
		if (geography=="county") {
			populationHandler = function(countyName,stateName) {
				countyObj = {};
				countyObj.population = d[i][1];
				countyObj.FIPS = pad(d[i][2]*1000 + d[i][3]*1,5);
				model.states[stateName].counties[countyName] = countyObj;
			};
			insuranceHandler = function(countyName,stateName) {
				countyObj = model.states[stateName].counties[countyName];
				if (countyObj) {	
					countyObj.uninsured = d[i][1];
				} else {
					console.log("Error: " + countyName + " does not exist");	
				}	
			};
		}
		
		function processDataEntry(geography) {
			var countyFullName=null, countyName=null, stateName=null, countyObj=null;
			if (geography == "county") {
				countyFullName = d[i][0].split(", ");
				countyName = countyFullName[0];
				stateName = countyFullName[1];
			} 
			if (dataset == "population") populationHandler(countyName,stateName);
			if (dataset == "insurance") insuranceHandler(countyName,stateName);
		};
		
		for (var i=1;i<d.length;i++) {
			processDataEntry(geography);
		}
	};
	this.processRequests = function(onDone) {
		var requestor = this, requestList = this.requestList;
		this.makeRequest(requestList[this.currentRequest][0],function(d) {
			requestor.dataHandler(d,requestList[requestor.currentRequest][1],requestList[requestor.currentRequest][2]);
			requestor.currentRequest++;
			if (requestor.currentRequest < requestList.length) requestor.processRequests(onDone);
			else onDone();
		});
	};
};