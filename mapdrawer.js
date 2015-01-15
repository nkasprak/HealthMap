// JavaScript Document

var mapDrawer = function(mdl, svg, custDisplayOptions) {
	var d = this;
	this.model = mdl;
	this.width = $("#"+svg).width();
	var displayOptions = {
		showDots:true,
		useShading:true,
		dotSize:10000,
		moeThreshold:.2,
		colors: {
			low: "#ffffff",
			high: "#048367"
		}
	};
	$.extend(true,displayOptions,custDisplayOptions);
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
	this.hexToRGB = function (hexString) {
		var r = parseInt(hexString.substr(1, 2), 16);
		var g = parseInt(hexString.substr(3, 2), 16);
		var b = parseInt(hexString.substr(5, 2), 16);
		return [r, g, b];
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
		function returnColor(p,m) {
			if (isNaN(p) || isNaN(m)) return "#c0c0c0";
			if (m/p > displayOptions.moeThreshold) return "#c0c0c0";
			var dataMax = custDisplayOptions.dataMax ? custDisplayOptions.dataMax : mdl.dataMax;
			var dataMin = custDisplayOptions.dataMin ? custDisplayOptions.dataMin : mdl.dataMin;
			var val = (p - dataMin)/(dataMax-dataMin);
			var lowColor = d.hexToRGB(displayOptions.colors.low);
			var highColor = d.hexToRGB(displayOptions.colors.high);
			function mult(a,s) {var r=[];for (var i =0;i<a.length;i++) {r[i]=a[i]*s}; return r;};
			function add(a1,a2) {var r=[];for (var i = 0;i<a1.length;i++) {r[i]=a1[i]+a2[i]}; return r;};
			var color = d.RGBToHex(add(mult(add(highColor,mult(lowColor,-1)),val),lowColor));
			return color;
		};
		var numDots, FIPS, color;
		var container = d3.select("#" + svg);
		$("#" + svg + " svg").remove();
		this.canvas = container.append("svg:svg")
			.attr("viewBox","0 0 566 390");
		d.dotList = [];
		
		for (var i=0;i<this.paths.length;i++) {
			FIPS = this.paths[i]["FIPS"]*1;
			color = "#bbb";
			if (displayOptions.useShading) {
				if (this.countiesByFIPS[FIPS]) {
					color = returnColor(this.countiesByFIPS[FIPS]["percentage"]["estimate"],
					this.countiesByFIPS[FIPS]["percentage"]["moe"]);
				}
			}
			this.pathsByFIPS[FIPS] = this.canvas.append("svg:path")
				.attr("d",this.paths[i]["path"])
				.attr("stroke-width",0)
				.attr("stroke","#ddd")
				.style("fill",color);
			if (this.countiesByFIPS[FIPS]) {
				this.pathsByFIPS[FIPS]
				.attr("acsdata:data",this.countiesByFIPS[FIPS]["data"]["estimate"])
				.attr("acsdata:data-error",this.countiesByFIPS[FIPS]["data"]["moe"])
				.attr("acsdata:denominator",this.countiesByFIPS[FIPS]["denominator"]["estimate"])
				.attr("acsdata:denominator-error",this.countiesByFIPS[FIPS]["denominator"]["moe"])
				.attr("acsdata:percentage",this.countiesByFIPS[FIPS]["percentage"]["estimate"])
				.attr("acsdata:percentage-error",this.countiesByFIPS[FIPS]["percentage"]["moe"]);
			}
			if (displayOptions.showDots) {
				if (this.countiesByFIPS[FIPS]) {
					numDots = Math.round(this.countiesByFIPS[FIPS].data.estimate/displayOptions.dotSize);
					this.calcDotCoords(numDots,FIPS);
				}
			};
		}
		
		d.mergedCountyPath = this.getMergedSmallCountiesPath();
		for (var state in d.mergedCountyPath) {
			color = "#bbb";
			if (displayOptions.useShading) {
				color = returnColor(d.model.states[state]["outCounty"]["percentage"]["estimate"],
				d.model.states[state]["outCounty"]["percentage"]["moe"]);
			}
			this.pathsByFIPS[d.model.states[state]["FIPS"]] = this.canvas.append("svg:path")
				.attr("d",d.mergedCountyPath[state])
				.attr("stroke-width",0)
				.attr("stroke","#ddd")
				.style("fill",color)
				.attr("acsdata:data",d.model.states[state]["outCounty"]["data"]["estimate"])
				.attr("acsdata:data-error",d.model.states[state]["outCounty"]["data"]["moe"])
				.attr("acsdata:denominator",d.model.states[state]["outCounty"]["denominator"]["estimate"])
				.attr("acsdata:denominator-error",d.model.states[state]["outCounty"]["denominator"]["moe"])
				.attr("acsdata:percentage",d.model.states[state]["outCounty"]["percentage"]["estimate"])
				.attr("acsdata:percentage-error",d.model.states[state]["outCounty"]["percentage"]["moe"]);
				
			if (displayOptions.showDots) {	
				numDots = Math.round(d.model.states[state]["outCounty"]["data"]["estimate"]/10000);
				this.calcDotCoords(numDots,d.model.states[state]["FIPS"]);
			}
		};
		if (displayOptions.showDots) this.drawDots();
		this.drawLegend();
	};
	this.getPoints = function(path) {
		var path = path.pathSegList;
		var points = [];
		for (var i=0;i<path.length;i++) {
			points.push([path[i].x,path[i].y]);	
		}
		return points;
	};
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
	this.drawLegend = function() {
		
		function format(val) {
			return Math.round(val*10000)/100 + "%";
		};
		
		var gradient = this.canvas.append("svg:defs")
			.append("svg:linearGradient")
			.attr("y1","0%")
			.attr("y2","0%")
			.attr("x1","0%")
			.attr("x2","100%")
			.attr("id","legendGradient");
		gradient.append("stop")
			.attr("offset","0")
			.attr("stop-color",displayOptions.colors.low);
		gradient.append("stop")
			.attr("offset","1")
			.attr("stop-color",displayOptions.colors.high);
			
		var legend = this.canvas.append("svg:rect")
			.attr("x",33)
			.attr("y",360)
			.attr("width",500)
			.attr("height",10)
			.attr("fill",'url(#legendGradient)');
			
		var legendLowText = this.canvas.append("svg:text")
			.attr("x",33)
			.attr("y",380)
			.attr("text-anchor","start")
			.text(format(custDisplayOptions.dataMin ? custDisplayOptions.dataMin : mdl.dataMin));
			
		var legendLowText = this.canvas.append("svg:text")
			.attr("x",533)
			.attr("y",380)
			.attr("text-anchor","end")
			.text(format(custDisplayOptions.dataMax ? custDisplayOptions.dataMax : mdl.dataMax))
	};
};

