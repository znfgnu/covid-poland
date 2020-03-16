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

	var lastDayFirstIndex = 1;
	var lastDayFirstDate = new Date(data[1][0].split(' ')[0]);
	increaseX.push(lastDayFirstDate);
	increaseInf.push(data[1][1]);
	increaseDea.push(data[1][2]);

	for (var i = 1; i < data.length-1; i++) {
		datetimes.push(data[i][0]);
		infected.push(data[i][1]);
		deaths.push(data[i][2]);

		if (i>1) {
			var today = new Date(data[i][0].split(' ')[0]);
			if (today.getDate() !== lastDayFirstDate.getDate()) {
				var dinf = data[i][1] - data[lastDayFirstIndex][1];
				var ddea = data[i][2] - data[lastDayFirstIndex][2];
				var dd = (today - new Date(data[lastDayFirstIndex][0].split(' ')[0])) / (1000 * 60 * 60 * 24);
				var incinf = dinf / dd;
				var incdea = ddea / dd;
				increaseX.push(today);
				increaseInf.push(incinf);
				increaseDea.push(incdea);
				lastDayFirstDate = today;
				lastDayFirstIndex = i;
			}
		}
	}

	increaseInf[0] = 'Nowe zakażenia dziennie: ' + increaseInf[increaseInf.length-1];
	increaseDea[0] = 'Nowe zgony dziennie: ' + increaseDea[increaseDea.length-1];

	for (var d = new Date(2020, 3-1, 5); d <= lastDayFirstDate; d.setDate(d.getDate() + 1)) {
		xticks.push(new Date(d));
	}

	var chart2 = c3.generate({
		bindto: '#chart2',
		bar: {
		  width: {
			ratio: 20,
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