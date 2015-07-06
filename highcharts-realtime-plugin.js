/*
 * The MIT License
Copyright (c) 2015 by Welton Hackbart
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
/**
 * Ao utilizar este plugin, nunca armazene referencias de chart diretamente.
 * Guarde apenas o index do chart e sempre que for necessario realizar uma
 * operacao com um dos charts da pagina, obtenha-o da seguinte forma
 * Highcharts.charts[index]. Além disso, para realizar qualquer operacao que nao
 * seja um addPoint, pare o updater (Highcharts.updater.stop()) antes. Ao
 * terminar de realizar a operação, faca o restart do updater
 * (Highcharts.updater.start()).
 */
(function(H) {
	"use strict";

	/**
	 * @options { interval: intervalo de redraw entre graficos, em milisegundos
	 *          (default = 1000), cycles: numero de ciclos de redraw para
	 *          reconstrucao do grafico (default = 60) }
	 */
	H.Updater = function(options) {
		var priv = {
			// indice do proximo chart a ser atualizado
			pointer : 0,
			// contador de ciclos de atualizacao para recriacao dos charts
			cycle : 0
		};
		var pub = {
			// status do updater
			started : false,
			// intervalo de atualizacao dos charts em milisegundos
			interval : 1000,
			// numero de ciclos de atualizacao antes da recriacao dos charts
			cycles : 60
		};

		priv.listener = function() {
			if (priv.pointer >= Highcharts.charts.length) {
				priv.pointer = 0;
				if (++priv.cycle > pub.cycles) {
					priv.cycle = 0;
				}
			}
			if (priv.cycle == pub.cycles) {
				Highcharts.charts[priv.pointer].mustRemake = true;
			}
			Highcharts.charts[priv.pointer++].redraw();
		}

		pub.start = function() {
			if (!pub.started) {
				pub.started = true;
				priv.scheduler = setInterval(priv.listener, pub.interval);
			}
		};

		pub.stop = function() {
			if (priv.scheduler) {
				clearInterval(priv.scheduler);
				delete priv.scheduler;
				pub.started = false;
			}
		};

		return pub;
	};

	H.updater = new H.Updater();

	H.Chart.prototype.remake = function() {
		var options = H.extend({}, this.options);
		delete options.series;
		options.series = [];
		var hiseries = this.series;
		// stock charts tem uma serie a mais, para o overview (range selector)
		var max = options._stock ? hiseries.length - 1 : hiseries.length;
		for (var i = 0; i < max; i++) {
			var hiserie = hiseries[i];
			var serie = H.extend({}, hiserie.options);
			delete serie.data;
			serie.data = [];
			for (var j = 0; j < hiserie.xData.length; j++) {
				serie.data.push([ hiserie.xData[j], hiserie.yData[j] ]);
			}
			options.series.push(serie);
		}

		var index = this.index;
		this.destroy();

		if (options._stock) {
			Highcharts.charts[index] = new Highcharts.StockChart(options);
		} else {
			Highcharts.charts[index] = new Highcharts.Chart(options);
		}
		Highcharts.charts[index].index = index;
		Highcharts.charts.pop();

		// verifica se foi registrado um listener 'remake' em
		// options.chart.events.remake e o invoca passando o chart recriado
		if (options.chart.hasOwnProperty('events')
				&& options.chart.events.remake) {
			options.chart.events.remake(Highcharts.charts[index]);
		}
	};

	H.wrap(H.Series.prototype, 'addPoint', function(proceed) {

		// Now apply the original function with the original arguments,
		// which are sliced off this function's arguments
		var args = Array.prototype.slice.call(arguments, 1);

		// se updater esta ativo, nao faz o redraw ao adicionar um novo ponto
		if (H.updater.started) {
			// define parametro 'redraw' para false
			if (args.length > 1) {
				args[1] = false;
			} else {
				args.push(false);
			}

			// para evitar que seja invocado quando o cliente requisitar
			// o chart para inclusoes de novos pontos, optou-se por fazer o
			// remake no addPoint. O problema eh que essa abordagem amarra o
			// intervalo de tempo entre um remake e outro ao tempo de execucao
			// do metodo addPoint para os charts, o que pode levar a uma carga
			// abrupta de processamento quando for a hora de refazer os charts.
			proceed.apply(this, args);
			if (this.chart.mustRemake) {
				this.chart.remake();
			}
		} else {
			proceed.apply(this, args);
		}
	});

}(Highcharts));
