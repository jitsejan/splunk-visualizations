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
            
            var margin = {top: 20, right: 20, bottom: 110, left: 100};
			var margin2 = {top: 430, right: 20, bottom: 30, left: 90};
            var width = 960 - margin.left - margin.right;
            var height = 500 - margin.top - margin.bottom;
			var height2 = 500 - margin2.top - margin2.bottom;
            
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

            display();
            
            function display() {
                var visItems = data.items;
                var rects, labels;

                rects = itemRects.selectAll("rect")
			        .data(visItems, function(d) { return d.id; })
                    .attr("x", function(d) {return x1(d.start);})
                    .attr("width", function(d) {return x1(d.end) - x1(d.start);});
                
                rects.enter().append("rect")
                    .attr("class", function(d) {return "miniItem" + d.lane;})
                    .attr("x", function(d) {return x1(d.start);})
                    .attr("y", function(d) {return y1(d.lane) + .5*data.lanes.length;})
                    .attr("width", function(d) {return x1(d.end) - x1(d.start);})
                    .attr("height", function(d) {return .7 * y1(1);})
                    .attr("title", function(d) {return d.name;});

                rects.exit().remove();



                // var extent = brush.extent();
                // console.log('extent', extent);
                // var minExtent = brush.extent()[0];
				// var maxExtent = brush.extent()[1];
                // console.log('minExtent', minExtent);
                // console.log('maxExtent', maxExtent);
				// var visItems = data.items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});
                // console.log('visItems', visItems);
            }
       }
    });
});
