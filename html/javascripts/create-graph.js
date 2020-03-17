function parseData(createGraph) {
	Papa.parse("../data/cov.csv", {
		download: true,
		complete: function(results) {
			createGraph(results.data);
			lastUpdated = results.data[results.data.length-2][0];
			document.getElementById("lastUpdated").innerHTML = lastUpdated;
		}
	});
}

function leadingZero(n){
  if(n < 10){
    return "0" + n;
  }
  return n;
}

function createGraph(data) {
	var datetimes = ['x'];
	var infected = ['Zakażeni: ' + data[data.length-2][1]];
	var deaths = ['Zgony: ' + data[data.length-2][2]];
	var xticks = [];

	var increaseX = [];
	var increaseInf = [''];
	var increaseDea = [''];

	var indexDayBefore = 0;
	var dateDayBefore = new Date("2020-03-03");//data[1][0].split(' ')[0]);

	for (var i = 1; i < data.length-1; i++) {
		datetimes.push(data[i][0]);
		infected.push(data[i][1]);
		deaths.push(data[i][2]);

		var today = new Date(data[i][0].split(' ')[0]);

		var isLastOfDay = false;
		if (i+1 < data.length-1) {
			var nextDay = new Date(data[i + 1][0].split(' ')[0]);
			if (nextDay.getDate() !== today.getDate()) isLastOfDay = true;
		} else {
			isLastOfDay = true;
		}

		if (isLastOfDay) {
			var dayBeforeInf;
			var dayBeforeDea;
			if (indexDayBefore === 0) {
				dayBeforeInf = 0;
				dayBeforeDea = 0;
			} else {
				dayBeforeInf = data[indexDayBefore][1];
				dayBeforeDea = data[indexDayBefore][2];
			}
			var dinf = data[i][1] - dayBeforeInf;
			var ddea = data[i][2] - dayBeforeDea;
			var dd = (today - dateDayBefore) / (1000 * 60 * 60 * 24);
			var incinf = dinf / dd;
			var incdea = ddea / dd;
			increaseX.push(today);
			increaseInf.push(incinf);
			increaseDea.push(incdea);
			dateDayBefore = today;
			indexDayBefore = i;
		}
	}

	increaseInf[0] = 'Nowe zakażenia dziennie: ' + increaseInf[increaseInf.length-1];
	increaseDea[0] = 'Nowe zgony dziennie: ' + increaseDea[increaseDea.length-1];

	for (var d = new Date(2020, 3-1, 5); d <= dateDayBefore; d.setDate(d.getDate() + 1)) {
		xticks.push(new Date(d));
	}

	var chart2 = c3.generate({
		bindto: '#chart2',
		bar: {
		  width: {
			ratio: 0.5,
		  }
		},
		data: {
			x: 'x',
	        xFormat: '%Y%m%d',
			columns: [
				increaseInf,
				increaseDea,
				['x'].concat(increaseX),
			],
			type: 'bar',
		},
		axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
					multiline: false,
	            	values: increaseX,
	            	format: '%d-%m'
            	}
	        }
		},
		legend: {
			position: 'inset'
		},
		tooltip: {
			format: {
				name: function (name, ratio, id, index) { return name.split(':')[0]; },
				title: function (d) {
					return d.getFullYear() + "-" + leadingZero(d.getMonth() + 1) + "-" + leadingZero(d.getDate());
				},
			},
		},
	});

	var chart = c3.generate({
		bindto: '#chart',
	    data: {
			x: 'x',
	        xFormat: '%Y-%m-%d %H:%M:%S',
	        columns: [
	        	datetimes,
	        	infected,
				deaths,
	        ],
	    },
	    axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
					multiline: false,
	            	values: xticks,
	            	format: '%d-%m'
            	}
	        }
	    },
		tooltip: {
			format: {
				name: function (name, ratio, id, index) { return name.split(':')[0]; },
				title: function (d) {
					return d.getFullYear() + "-" + leadingZero(d.getMonth() + 1) + "-" + leadingZero(d.getDate()) + " " + leadingZero(d.getHours()) + ":" + leadingZero(d.getMinutes()) + ":" + leadingZero(d.getSeconds());
				},
			},
		},
	    zoom: {
        	enabled: true
    	},
	    legend: {
	        position: 'inset'
	    },
		// grid: {
		// 	x: {
		// 		lines: [
		// 			{value: new Date(2020, 3-1, 14), text: 'Wprowadzenie stanu zagrożenia epidemicznego'},
		// 			{value: new Date(2020, 3-1, 15), text: 'Ograniczenie ruchu międzynarodowego'},
		// 		]
		// 	}
		// },
	});
}

parseData(createGraph);