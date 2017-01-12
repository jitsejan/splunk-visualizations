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
					'start': row[1],
					'end': row[2],
					'id': counter
				};
				items.push(item);
                counter = counter + 1;
            });

            console.log('lanes', lanes);
            console.log('items', items);
            return {lanes: lanes};
        },
  
        updateView: function(data, config) {
             
            // Check for an empty data object
			if(data.lanes.length < 1){
				return false;
			}
       
            // Clear the div
            this.$el.empty();
            
            var width = 700;
            var height = 400;
            
            // Create the canvas
			var svg = d3.select(this.el)
						.append('svg')
							.style('width', width + 'px')
							.style('height', height + 'px')
							.style('margin', '0 auto');

            // Add a g and make it the active svg component
			svg = svg.append('g');

       }
    });
});
