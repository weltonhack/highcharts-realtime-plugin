/**
 * @options { numseries : numero de series, interval : intervalor de geracao em
 *          milisegundos }
 */
var IntervalGenerator = function(options) {
	var priv = {};
	var pub = {};

	priv.onInterval = function() {
		if (pub.listener) {
			var now = new Date().getTime();
			for (var i = 0; i < priv.options.numseries; i++) {
				pub.listener({
					serie : i,
					x : now,
					y : Math.round(Math.random() * 100)
				});
			}
		}
	};

	pub.start = function() {
		priv.scheduler = setInterval(priv.onInterval, priv.options.interval);
	};

	pub.stop = function() {
		clearInterval(priv.scheduler);
	};

	priv.options = options;
	return pub;
};

/**
 * Highcharts Adapter
 * 
 * @param id
 *            target DOM element
 * @param model
 *            series model. Ex.: { seed: numero inicial de pontos, series :
 *            [{id:'1', label:'serie1'}, ...] }
 */
var RealtimeChart = function(target, model) {

	var priv = {};
	var pub = {};

	// ################ privado ################
	priv.modelToOptions = function(model, reuseSeries) {
		var options = {
			map : {},
			series : [],
			chart : {
				animation : false,
				shadown : false,
				renderTo : model.id,
				type : 'line'
			},
			plotOptions : {
				series : {
					animation : false,
					states : {
						hover : {
							enabled : false
						}
					}
				}
			},
			tooltip : {
				enabled : true,
				animation : false,
				followPointer : false,
				followTouchMove : false,
				shadow : false,
				shared : true
			},
			rangeSelector : {
				buttons : [ {
					count : 10,
					type : 'second',
					text : '10s'
				}, {
					count : 5,
					type : 'minute',
					text : '5M'
				}, {
					type : 'all',
					text : 'All'
				} ],
				inputEnabled : false,
				selected : 0
			},
			exporting : {
				enabled : false
			}
		};
		for (var i = 0; i < model.series.length; i++) {
			var data = [];
			if (reuseSeries) {
				data = priv.reconstructData(i);
			} else {
				var time = new Date().getTime();
				for (var j = -1 * model.seed; j <= 0; j += 1) {
					data
							.push([ time + j * 100,
									Math.round(Math.random() * 100) ]);
				}
			}
			var serie = model.series[i];
			options.map[serie.id] = i;
			options.series.push({
				id : serie.id,
				name : serie.label,
				animate : false,
				downsample : {
					threshold : 0
				},
				data : data
			});
		}

		return options;
	};

	// ################ construtor ################
	new Highcharts.StockChart(priv.modelToOptions(model));
	return pub;
};

(function($) {

	$.fn.RealtimeChart = function(model) {
		if (!model.id) {
			model.id = this.attr('id');
		}
		var chart = new RealtimeChart(this, model);
		return this;
	};

}(jQuery));

$(function() {

	Highcharts.setOptions({
		global : {
			useUTC : false
		}
	});

});
