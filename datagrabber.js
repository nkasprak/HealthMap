// JavaScript Document

var dataGrabber = function(key, url, model, requestList) {
	this.key = key;
	this.url = url;
	this.requestList = requestList;
	this.dataHandler = function(d,theRequest) {
		var denominatorHandler, datasetHandler, pad = function (n, width) {
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
		};
		var geography = theRequest[2];
		var dataset = theRequest[1];
		if (geography=="state") {
			denominatorHandler = function(estOrMOE) {
				if (typeof(model.states)=="undefined") model.states = {};
				if (estOrMOE == "E") {
					var stateObj = {};
					stateObj.denominator={};
					stateObj.denominator.estimate = d[i][1];
					stateObj.FIPS = d[i][2];	
					stateObj.counties = {};
					model.states[d[i][0]] = stateObj;
				} else if (estOrMOE == "M") {
					var stateObj = model.states[d[i][0]];
					stateObj.denominator.moe = d[i][1];
				}
			};
			datasetHandler = function(estOrMOE) {
				if (estOrMOE == "E") {
					stateObj = model.states[d[i][0]];
					stateObj.data = {};
					stateObj.data.estimate = d[i][1];
				} else if (estOrMOE == "M") {
					stateObj = model.states[d[i][0]];
					stateObj.data.moe = d[i][1];
				}
			};
		}
		if (geography=="county") {
			denominatorHandler = function(estOrMOE,countyName,stateName) {
				if (estOrMOE == "E") {
					
					countyObj = {};
					countyObj.denominator = {};
					countyObj.denominator.estimate = d[i][1];
					countyObj.FIPS = pad(d[i][2]*1000 + d[i][3]*1,5);
					model.states[stateName].counties[countyName] = countyObj;
				} else if (estOrMOE == "M") {
					countyObj = model.states[stateName].counties[countyName];
					countyObj.denominator.moe = d[i][1];
				}
			};
			datasetHandler = function(estOrMOE,countyName,stateName) {
				try {
					if (estOrMOE == "E") {
						countyObj = model.states[stateName].counties[countyName];
						if (countyObj) {
							countyObj.data = {};	
							countyObj.data.estimate = d[i][1];
						} else {
							throw("Error: " + countyName + " does not exist");	
						}
					} else if (estOrMOE == "M") {	
						countyObj = model.states[stateName].counties[countyName];
						if (countyObj) {	
							countyObj.data.moe = d[i][1];
						}
					}
				} catch (ex) {
					console.log(ex);	
				}
			};
		}
		function processDataEntry(geography,estOrMOE) {
			var countyFullName=null, countyName=null, stateName=null, countyObj=null;
			if (geography == "county") {
				countyFullName = d[i][0].split(", ");
				countyName = countyFullName[0];
				stateName = countyFullName[1];
			}
			if (dataset == "denominator") denominatorHandler(estOrMOE,countyName,stateName);
			if (dataset == "dataset") datasetHandler(estOrMOE,countyName,stateName);
		};
		for (var i=1;i<d.length;i++) {
			processDataEntry(geography,theRequest[3]);
		}
	};
	this.makeRequest = function(request, callback) {
		var geturl = this.url + "get=NAME," + request[0] + request[3] + "&for=" + request[2] + ":*&key=" + this.key;
		$.get(geturl, null, function(d) {
			callback(d);
		});
	};
	this.currentRequest = 0; //tracks data vs denom
	this.setupRequests = function() {
		var geos = ["state","county"];
		var modes = ["E","M"];
		this.requestList = [];
		for (var i = 0;i<requestList.length;i++) {
			for (j=0;j<geos.length;j++) {
				for (var k=0;k<modes.length;k++) {
					this.requestList.push([requestList[i][0],requestList[i][1],geos[j],modes[k]]);	
				}
			};
		};
	};
	this.setupRequests();
	this.processRequests = function(onDone) {
		var requestor = this;
		var requestList = requestor.requestList;
		this.makeRequest(requestList[requestor.currentRequest],function(d) {
			requestor.dataHandler(d,requestList[requestor.currentRequest]);
			requestor.currentRequest++;
			if (requestor.currentRequest < requestList.length) {
				requestor.processRequests(onDone);
			} else {
				onDone();
			}
		});
	};
};