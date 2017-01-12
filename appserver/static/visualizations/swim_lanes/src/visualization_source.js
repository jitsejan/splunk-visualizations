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
            var timeBegin = 2017;
            var timeEnd = 0;

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
                    'duration': parseInt(row[3]),
                    'title': (row[4] || $.grep(lanes, function(element, index){ return element.name === rows[i][0]; })[0]['name']),
					'id': counter
				};
                if(item.start < timeBegin){
                    timeBegin = item.start;
                }
                if(item.end > timeEnd){
                    timeEnd = item.end;
                }
				items.push(item);
                counter = counter + 1;
            });

            
			
            console.log('timeBegin', timeBegin);
            console.log('timeEnd', timeEnd);
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
            
            var margin = {top: 20, right: 40, bottom: 110, left: 150};
			var margin2 = {top: 730, right: 40, bottom: 30, left: 150};
            var width = 1400 - margin.left - margin.right;
            var height = 800 - margin.top - margin.bottom;
			var height2 = 800 - margin2.top - margin2.bottom;
            
            console.log('width', width);
            console.log('height', height);
            // Create the canvas
			var svg = d3.select(this.el)
						.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("class", "chart");

           //scales
            var x = d3.scaleLinear()
                    .domain([data.timeBegin, data.timeEnd])
                    .range([0, width]);
            var x1 = d3.scaleLinear()
                    .domain([data.timeBegin, data.timeEnd])
                    .range([0, width]);
            var y1 = d3.scaleLinear()
                    .domain([0, data.lanes.length])
                    .range([0, height]);
            var y2 = d3.scaleLinear()
                    .domain([0, data.lanes.length])
                    .range([0, height2]);

            // Add a g and make it the active svg component
			svg = svg.append('g');

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            var main = svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("class", "main");

            var mini = svg.append("g")
                        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
                        .attr("width", width)
                        .attr("height", height2)
                        .attr("class", "mini");
            
            // Main lanes and texts
            main.append("g").selectAll(".laneLines")
                .data(data.items)
                .enter().append("line")
                .attr("x1", margin.right)
                .attr("y1", function(d) {return y1(d.lane);})
                .attr("x2", width)
                .attr("y2", function(d) {return y1(d.lane);})
                .attr("stroke", "lightgray")

            main.append("g").selectAll(".laneText")
                .data(data.lanes)
                .enter().append("text")
                .text(function(d) {return d.name;})
                .attr("x", -margin.right)
                .attr("y", function(d, i) {return y1(i + .5);})
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            // Mini lanes and texts
            mini.append("g").selectAll(".laneLines")
                .data(data.items)
                .enter().append("line")
                .attr("x1", margin.right)
                .attr("y1", function(d) {return y2(d.lane);})
                .attr("x2", width)
                .attr("y2", function(d) {return y2(d.lane);})
                .attr("stroke", "lightgray");

            mini.append("g").selectAll(".laneText")
                .data(data.lanes)
                .enter().append("text")
                .text(function(d) {return d.name;})
                .attr("x", -margin.right)
                .attr("y", function(d, i) {return y2(i + .5);})
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            var itemRects = main.append("g")
							.attr("clip-path", "url(#clip)");
		
            // Brush
            var brush = d3.brushX(x)
                .extent([[0, 0], [width, height2]])
                .on("brush", display);

            mini.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, x.range())
                .selectAll("rect")
                .attr("y", 1)
                .attr("height", height2 - 1);

            var xAxis = d3.axisBottom(x)
                .tickFormat(function(d) { return d; });

            main.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            display();
            
            function display() {
                var visItems = data.items;
                var rects, labels;
                var minExtent = 0;

                rects = itemRects.selectAll("rect")
			        .data(visItems, function(d) { return d.id; })
                    .attr("x", function(d) {return x1(d.start);})
                    .attr("width", function(d) {return x1(d.end) - x1(d.start);});
                
                rects.enter().append("rect")
                    .attr("id", function(d) {return "miniItem" + d.lane;})
                    .attr("class", "miniItem")
                    .attr("x", function(d) {return x1(d.start);})
                    .attr("y", function(d) {return y1(d.lane) + .5*data.lanes.length;})
                    .attr("width", function(d) {return x1(d.end) - x1(d.start);})
                    .attr("height", function(d) {return .7 * y1(1);});

                rects.exit().remove();

                labels = itemRects.selectAll("text")
                    .data(visItems, function (d) { return d.id; })
                    .attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});

                labels.enter().append("text")
                    .text(function(d) {return d.title;})
                    .attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
                    .attr("y", function(d) {return y1(d.lane + .5);})
                    .attr("text-anchor", "start");

                labels.exit().remove();

            }
       }
    });
});
