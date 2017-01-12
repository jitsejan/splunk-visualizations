define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3
        ) {
  
    return SplunkVisualizationBase.extend({
 
        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);
             
            // Add a css selector class
            this.$el.addClass('splunk-directed-graph');
        },
 
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        formatData: function(data, config) {
            
            var fields = data.fields;
			var rows = data.rows;
            
            var lanes = [];
            var items = [];
            var uniqueNames = [];
            var counter = 0;
            var timeBegin = 1700;
            var timeEnd = 2017;

            // Define the lanes
            rows.forEach( function(row, i) {
                var laneName = row[0];
                if($.inArray(laneName, uniqueNames) == -1){
                    lanes.push({'id': counter, 'name': laneName});
                    uniqueNames.push(laneName);
                    counter = counter + 1;
                }
            });

            rows.forEach( function(row, i) {
				item = {
                    'lane': $.grep(lanes, function(element, index){ return element.name === rows[i][0]; })[0]['id'],
                    'start': parseInt(row[1]),
                    'end': parseInt(row[2]),
					'id': counter
				};
				items.push(item);
                counter = counter + 1;
            });

            
			

            console.log('lanes', lanes);
            console.log('items', items);
            return {lanes: lanes, items: items, timeBegin: timeBegin, timeEnd: timeEnd};
        },
  
        updateView: function(data, config) {
             
            // Check for an empty data object
			if(data.lanes.length < 1){
				return false;
			}
       
            // Clear the div
            this.$el.empty();
            
            var m = [20, 15, 15, 120], //top right bottom left
			w = 960 - m[1] - m[3],
			h = 500 - m[0] - m[2],
			miniHeight = data.lanes.length * 12 + 50,
			mainHeight = h - miniHeight - 50;
            
            // Create the canvas
			var svg = d3.select(this.el)
						.append("svg")
                        .attr("width", w + m[1] + m[3])
                        .attr("height", h + m[0] + m[2])
                        .attr("class", "chart");

           //scales
            var x = d3.scaleLinear()
                    .domain([data.timeBegin, data.timeEnd])
                    .range([0, w]);
            var x1 = d3.scaleLinear()
                    .range([0, w]);
            var y1 = d3.scaleLinear()
                    .domain([0, data.lanes.length])
                    .range([0, mainHeight]);
            var y2 = d3.scaleLinear()
                    .domain([0, data.lanes.length])
                    .range([0, miniHeight]);

            // Add a g and make it the active svg component
			svg = svg.append('g');

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", w)
                .attr("height", mainHeight);

            var main = svg.append("g")
                        .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
                        .attr("width", w)
                        .attr("height", mainHeight)
                        .attr("class", "main");

            var mini = svg.append("g")
                        .attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
                        .attr("width", w)
                        .attr("height", miniHeight)
                        .attr("class", "mini");
            
            //main lanes and texts
            main.append("g").selectAll(".laneLines")
                .data(data.items)
                .enter().append("line")
                .attr("x1", m[1])
                .attr("y1", function(d) {return y1(d.lane);})
                .attr("x2", w)
                .attr("y2", function(d) {return y1(d.lane);})
                .attr("stroke", "lightgray")

            main.append("g").selectAll(".laneText")
                .data(data.lanes)
                .enter().append("text")
                .text(function(d) {return d.name;})
                .attr("x", -m[1])
                .attr("y", function(d, i) {return y1(i + .5);})
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            //mini lanes and texts
            mini.append("g").selectAll(".laneLines")
                .data(data.items)
                .enter().append("line")
                .attr("x1", m[1])
                .attr("y1", function(d) {return y2(d.lane);})
                .attr("x2", w)
                .attr("y2", function(d) {return y2(d.lane);})
                .attr("stroke", "lightgray");

            mini.append("g").selectAll(".laneText")
                .data(data.lanes)
                .enter().append("text")
                .text(function(d) {return d.name;})
                .attr("x", -m[1])
                .attr("y", function(d, i) {return y2(i + .5);})
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            var itemRects = main.append("g")
							.attr("clip-path", "url(#clip)");
		
            
       }
    });
});
