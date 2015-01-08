// JavaScript Document

var mapDrawer = function(mdl, svg) {
	var d = this;
	this.model = mdl;
	this.canvas = svg;
	this.getData = function(url,callback) {
		$.get(url,null,function(p) {
			d.storeData(p);
			callback();
		});
	};
	this.storeData = function(p) {
		this.paths = p;
	};
	this.draw = function() {
		
	};
};