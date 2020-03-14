/*
 * Parse the data and create a graph with the data.
 */
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

function createGraph(data) {
	var datetimes = ['x'];
	var infected = ['Zakażeni'];
	var deaths = ['Zgony'];

	for (var i = 1; i < data.length-1; i++) {
		datetimes.push(data[i][0]);
		infected.push(data[i][1]);
		deaths.push(data[i][2]);
	}

	console.log(datetimes);
	console.log(infected);
	console.log(deaths);

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
	            // categories: datetimes,
	            tick: {
	            	format: '%m/%d',
            	}
	        }
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