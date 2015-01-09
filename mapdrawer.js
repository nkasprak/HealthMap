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
	this.countiesByFIPS = (function() {
		var toReturn = {};
		for (var s in d.model.states) {(function(state) {
			for (var c in state.counties) {(function(county, name) {
				var cObj = {};
				cObj.name = name;
				for (var prop in county) {
					cObj[prop] = county[prop];	
				}
				toReturn[county["FIPS"]] = cObj;
			})(state.counties[c], c);}
		})(d.model.states[s]);}
		return toReturn;
	})();
	this.storeData = function(p) {
		this.paths = p;
	};
	this.pathsByFIPS = {};
	this.draw = function() {
		var numDots, FIPS;
		var container = d3.select("#" + svg);
		this.canvas = container.append("svg:svg")
			.attr("width",this.width)
			.attr("height",this.width*0.7);
		var scaleFactor = this.width/560;
		for (var i=0;i<this.paths.length;i++) {
			FIPS = this.paths[i]["FIPS"];
			this.pathsByFIPS[FIPS] = this.canvas.append("svg:path")
				.attr("d",this.paths[i]["path"])
				.attr("stroke-width",0.25)
				.attr("stroke","#ddd")
				.style("fill","#fff");
				//.attr("transform","scale(" + scaleFactor + ")");
			if (this.countiesByFIPS[FIPS]) {
				numDots = Math.round(this.countiesByFIPS[FIPS].uninsured/10000);
				this.fillDots(numDots,FIPS,container);
			}
		};	
	};
	this.fillDots = function(numDots, FIPS, container) {
		function getPoints(path) {
			var path = path.pathSegList;
			var points = [];
			for (var i=0;i<path.length;i++) {
				points.push([path[i].x,path[i].y]);	
			}
			return points;
		}
		function fillPath(FIPS) {
			if (d.pathsByFIPS[FIPS]) var path = d.pathsByFIPS[FIPS].node();
			else return false;
			var points = getPoints(path);
			var pointsInPolygon = 0;
			var bbox = path.getBBox();
			var randX,randY;
			var usedPoints = [];
			while (pointsInPolygon < numDots) {
				//Generate random point inside path bbox
				var randX = Math.random()*bbox.width+bbox.x;
				var randY = Math.random()*bbox.height+bbox.y;	
				
				//check to see if it's in the path
				if (pip([randX,randY],points)) {
					usedPoints.push({x:randX,y:randY});
					pointsInPolygon++;
				}
				if (pointsInPolygon > 100) break;
			}
			return usedPoints;
		}
		var dots = fillPath(FIPS);
		var circle;
		for (var i = 0; i<dots.length;i++) {
			circle = d3.select(document.createElement("circle"))
				.attr("cx", dots[i].x)
				.attr("cy", dots[i].y)
				.attr("r", 0.5)
				.attr("fill","black");
			d.canvas.node().appendChild(circle.node());
		};
		console.log(FIPS);
	};
};

