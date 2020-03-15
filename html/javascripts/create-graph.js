/*
 * Parse the data and create a graph with the data.
 */
function parseData(createGraph) {
	Papa.parse("../data/cov.csv", {
		download: true,
		complete: function(results) {
			createGraph(results.data);
			lastUpdated = results.data[results.data.length-2][0];
			infectedNow = results.data[results.data.length-2][1];
			deathsNow = results.data[results.data.length-2][2];
			document.getElementById("lastUpdated").innerHTML = lastUpdated;
			document.getElementById("infectedNow").innerHTML = infectedNow;
			document.getElementById("deathsNow").innerHTML = deathsNow;
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
	var infected = ['Zakażeni'];
	var deaths = ['Zgony'];
	var xticks = [];

	for (var i = 1; i < data.length-1; i++) {
		datetimes.push(data[i][0]);
		infected.push(data[i][1]);
		deaths.push(data[i][2]);
	}

	var now = new Date();
	for (var d = new Date(2020, 3-1, 5); d <= now; d.setDate(d.getDate() + 1)) {
		xticks.push(new Date(d));
	}

	var chart = c3.generate({
		bindto: '#chart',
	    data: {
			x: 'x',
	        xFormat: '%Y-%m-%d %H:%M:%S',
	        columns: [
	        	datetimes,
	        	infected,
				deaths,
	        ]
	    },
	    axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
	            	values: xticks,
	            	format: '%Y-%m-%d'
            	}
	        }
	    },
		tooltip: {
			format: {
				title: function (d) {
					return d.getFullYear() + "-" + leadingZero(d.getMonth() + 1) + "-" + leadingZero(d.getDate()) + " " + leadingZero(d.getHours()) + ":" + leadingZero(d.getMinutes()) + ":" + leadingZero(d.getSeconds());
				},
			},
		},
	    zoom: {
        	enabled: true
    	},
	    legend: {
	        position: 'right'
	    }
	});
}

parseData(createGraph);