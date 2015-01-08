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
	this.storeData = function(p) {
		this.paths = p;
	};
	this.pathsByFIPS = {};
	this.draw = function() {
		var container = d3.select("#" + svg);
		this.canvas = container.append("svg:svg")
			.attr("width",this.width)
			.attr("height",this.width*0.6);
		var scaleFactor = this.width/560;
		for (var i=0;i<this.paths.length;i++) {
			this.pathsByFIPS[this.paths[i]["FIPS"]] = this.canvas.append("svg:path")
				.attr("d",this.paths[i]["path"])
				.attr("stroke-width",0.5)
				.attr("stroke","black")
				.style("fill","none")
				.attr("transform","scale(" + scaleFactor + ")");
		};	
	};
};

