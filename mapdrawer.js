// JavaScript Document

var mapDrawer = function(mdl, svg) {
	var d = this;
	this.model = mdl;
	this.width = $("#"+svg).width();
	this.getData = function(url,callback) {
		$.get(url,null,function(p) {
			d.storeData(p);
			callback();
		});
	};
	this.RGBToHex = function (rgbArray) {
		function pad(num, size) {
			var s = "0" + num;
			return s.substr(s.length - size);
		}
		return "#" + pad(Math.round(rgbArray[0]).toString(16), 2) + pad(Math.round(rgbArray[1]).toString(16), 2) + pad(Math.round(rgbArray[2]).toString(16), 2);
	};
	this.loopThroughCountiesInModel = function(countyHandler) {
		for (var s in d.model.states) {(function(state) {
			for (var c in state.counties) {(function(county, name) {
				countyHandler(county,name);
			})(state.counties[c], c);}
		})(d.model.states[s]);}
	};
	this.countiesByFIPS = (function() {
		var toReturn = {};
		d.loopThroughCountiesInModel(function(county,name) {
		var cObj = {};
			cObj.name = name;
			for (var prop in county) {
				cObj[prop] = county[prop];	
			}
			toReturn[county["FIPS"]*1] = cObj;
		});
		return toReturn;
	})();
	this.getMergedSmallCountiesPath = function() {
		var toReturn = {}, FIPSlist = {}, FIPSbyState = {};
		for (var i = 0;i<d.paths.length;i++) {
			FIPSlist[d.paths[i]["FIPS"]] = 1;
		}
		d.loopThroughCountiesInModel(function(county,name) {
			var FIPS = county.FIPS;
			delete FIPSlist[FIPS];
		});
		var stateFIPS;
		for (var FIPS in FIPSlist) {
			stateFIPS = Math.round((FIPS - FIPS%1000)/1000);
			if (typeof(FIPSbyState[stateFIPS])=="undefined") FIPSbyState[stateFIPS] = [];
			FIPSbyState[stateFIPS].push(FIPS*1);
		};
		var pathString;

		for (stateFIPS in FIPSbyState) {
			
			pathString = "";
			for (i=0;i<FIPSbyState[stateFIPS].length;i++) {
				
				FIPS = FIPSbyState[stateFIPS][i];
				
				if (d.pathsByFIPS[FIPS]) pathString += d.pathsByFIPS[FIPS].attr("d");	
			}
			toReturn[d.model.statesByFIPS[stateFIPS]] = pathString;
		}
		return toReturn;
	};
	this.storeData = function(p) {
		this.paths = p;
	};
	this.pathsByFIPS = {};
	this.draw = function() {
		function returnColor(uninsured,ppl) {
			var color = 3*uninsured/ppl;
			return d.RGBToHex([255*(1.1-color),255*(1-color),255*(1-1.1*color)]);
		};
		var numDots, FIPS, color;
		var container = d3.select("#" + svg);
		
		this.canvas = container.append("svg:svg")
			.attr("width",this.width)
			.attr("height",this.width*0.6342)
			.attr("viewBox","0 0 566 359");
		d.dotList = [];
		for (var i=0;i<this.paths.length;i++) {
			FIPS = this.paths[i]["FIPS"]*1;
			if (this.countiesByFIPS[FIPS]) {
				color = returnColor(this.countiesByFIPS[FIPS]["uninsured"],this.countiesByFIPS[FIPS]["population"]);
				console.log(color);
			}
			this.pathsByFIPS[FIPS] = this.canvas.append("svg:path")
				.attr("d",this.paths[i]["path"])
				.attr("stroke-width",0)
				.attr("stroke","#ddd")
				.style("fill",color);
			if (this.countiesByFIPS[FIPS]) {
				numDots = Math.round(this.countiesByFIPS[FIPS].uninsured/10000);
				this.calcDotCoords(numDots,FIPS);
			}
		};
		
		d.mergedCountyPath = this.getMergedSmallCountiesPath();
		for (var state in d.mergedCountyPath) {
			
			color = returnColor(d.model.states[state]["outCounty"]["uninsured"],d.model.states[state]["outCounty"]["population"]);
			this.pathsByFIPS[d.model.states[state]["FIPS"]] = this.canvas.append("svg:path")
				.attr("d",d.mergedCountyPath[state])
				.attr("stroke-width",0)
				.attr("stroke","#ddd")
				.style("fill",color);
			numDots = Math.round(d.model.states[state]["outCounty"]["uninsured"]/10000);
			this.calcDotCoords(numDots,d.model.states[state]["FIPS"]);
		};
		this.drawDots();
	};
	this.getPoints = function(path) {
		var path = path.pathSegList;
		var points = [];
		for (var i=0;i<path.length;i++) {
			points.push([path[i].x,path[i].y]);	
		}
		return points;
	}
	this.calcDotCoords = function(numDots, FIPS) {
		
		function fillPath(FIPS) {
			if (d.pathsByFIPS[FIPS]) var path = d.pathsByFIPS[FIPS].node();
			var points = d.getPoints(path);
			var pointsInPolygon = 0;
			var bbox = path.getBBox();
			var randX,randY;
			var usedPoints = [];
			var errCounter = 0;
			while (pointsInPolygon < numDots) {
				
				//Generate random point inside path bbox
				var randX = Math.random()*bbox.width+bbox.x;
				var randY = Math.random()*bbox.height+bbox.y;	
				
				//check to see if it's in the path
				if (pip([randX,randY],points)) {
					usedPoints.push({x:randX,y:randY});
					pointsInPolygon++;
				}
				
				errCounter++;
				
				if (errCounter > 100) break;
			}
			return usedPoints;
		}
		d.dotList = d.dotList.concat(fillPath(FIPS));
	};
	this.drawDots = function() {
		var dots = d.dotList;
		
		var circle = this.canvas.selectAll("circle")
			.data(dots)
			.enter()
			.append("circle");
		
		var attrs = circle
			.attr("cx", function(d) {return d.x})
			.attr("cy", function(d) {return d.y})
			.attr("r", 0.5)
			.attr("fill","#000");
	};
};

