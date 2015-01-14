var postProcessing = function(model) {
	this.calcOutOfCounty = function() {
		var state, county, stateObj, countyObj, runningStateDen, runningStateDat, percentage, runningStateVariance;
		for (state in model.states) {
			stateObj = model.states[state];
			runningStateDen = stateObj.denominator.estimate;
			runningStateDat = stateObj.data.estimate;
			runningStateDenVar = Math.pow(stateObj.denominator.moe,2);
			runningStateDatVar = Math.pow(stateObj.data.moe,2);
			for (county in stateObj.counties) {
				countyObj = stateObj.counties[county];
				if (!isNaN(countyObj.denominator.estimate) 	&& !isNaN(countyObj.data.estimate) &&
					!isNaN(countyObj.denominator.moe)		&& !isNaN(countyObj.data.moe)) {
					runningStateDen -= countyObj.denominator.estimate;
					runningStateDat -= countyObj.data.estimate;
					runningStateDenVar += Math.pow(countyObj.denominator.moe,2);
					runningStateDatVar += Math.pow(countyObj.data.moe,2);
					percentage = countyObj.data.estimate/countyObj.denominator.estimate;
					countyObj.percentage = {};
					countyObj.percentage.estimate = percentage;
					countyObj.percentage.moe = Math.sqrt(
						Math.pow(countyObj.data.moe/countyObj.data.estimate,2) +
						Math.pow(countyObj.denominator.moe/countyObj.denominator.estimate,2)
					)*countyObj.percentage.estimate;
					if (typeof(model.dataMin)=="undefined") model.dataMin = percentage;
					else model.dataMin = Math.min(model.dataMin,percentage);
					if (typeof(model.dataMax)=="undefined") model.dataMax = percentage;
					else model.dataMax = Math.max(model.dataMax,percentage);
				}
			}
			
			stateObj.outCounty = {};
			stateObj.outCounty.denominator = {estimate: runningStateDen, moe:Math.sqrt(runningStateDenVar)};
			stateObj.outCounty.data = {estimate: runningStateDat, moe:Math.sqrt(runningStateDatVar)};
			stateObj.outCounty.percentage = {};
			stateObj.outCounty.percentage.estimate = stateObj.outCounty.data.estimate/stateObj.outCounty.denominator.estimate;
			stateObj.outCounty.percentage.moe =  Math.sqrt(
				Math.pow(stateObj.outCounty.data.moe/stateObj.outCounty.data.estimate,2) +
				Math.pow(stateObj.outCounty.denominator.moe/stateObj.outCounty.denominator.estimate,2)
			)*stateObj.outCounty.percentage.estimate;
			if (!isNaN(stateObj.outCounty.percentage.estimate)) {
				model.dataMax = Math.max(model.dataMax,stateObj.outCounty.percentage.estimate);
				model.dataMin = Math.min(model.dataMin,stateObj.outCounty.percentage.estimate);
			}
		}
	}
	model.statesByFIPS = (function() {
		var toReturn = {};
		for (var state in model.states) {
			toReturn[model.states[state]["FIPS"]*1] = state;	
		}
		return toReturn;
	})();
};