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

        formatData: function(data) {
            console.log("data.fields", data.fields);
            
            var nodes = {};
            var links = [];
            
            var fields = data.fields;
			var rows = data.rows;

            rows.forEach( function(row) {
                var sourceName = row[0];
                var targetName = row[1];
                var categoryName = row[2];
                var link = {}
                link.source = nodes[sourceName] || 
                    (nodes[sourceName] = {name: sourceName, group: categoryName, value: 0});
                link.target = nodes[targetName] || 
                    (nodes[targetName] = {name: targetName, group: categoryName, value: 0});
                link.value = +link.value;
                console.log("Link", link)
                links.push(link);
            });
            
            console.log("D3 formatted data", {nodes: d3.values(nodes), links: links});
            return {nodes: d3.values(nodes), links: links};
        },
  
        updateView: function(data, config) {
             
            // Check for an empty data object
			if(data.nodes.length < 1){
				return false;
			}
       
            // Clear the div
            this.$el.empty();
            
            var that = this;
            var height = this.$el.height();
            var width = this.$el.width();

            var mainColor = config[this.getPropertyNamespaceInfo().propertyNamespace + 'mainColor'] || '#f7bc38';

            // Create the canvas
			var svg = d3
						.select(this.el)
						.append('svg')
							.style('width', width + 'px')
							.style('height', height + 'px')
							.style('margin', '0 auto');                            ;

			// Add a background rectangle
			svg
				.append('rect')
					.attr('width', width)
					.attr('height', height)
					.attr('fill', mainColor);

			// Add a g and make it the active svg component
			svg = svg.append('g');

            
        
            // // Set domain max
            // var maxValue = parseFloat(config[this.getPropertyNamespaceInfo().propertyNamespace + 'maxValue']) || 100;

            // // Set height and width
            // var height = 220;
            // var width = 220;
    
            // // Create a radial scale representing part of a circle
            // var scale = d3.scale.linear()
            //     .domain([0, maxValue])
            //     .range([ - Math.PI * .75, Math.PI * .75])
            //     .clamp(true);
    
            // // Create parameterized arc definition
            // var arc = d3.svg.arc()
            //     .startAngle(function(d){
            //         return scale(0);
            //     })
            //     .endAngle(function(d){
            //         return scale(d)
            //     })
            //     .innerRadius(70)
            //     .outerRadius(85);

            // // SVG setup
            // var svg  = d3.select(this.el).append('svg')
            //     .attr('width', width)
            //     .attr('height', height)
            //     .style('background', 'white')
            //     .append('g')
            //     .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            // // Background arc
            // svg.append('path')
            //     .datum(maxValue)
            //     .attr('d', arc)
            //     .style('fill', 'lightgray');

            // // Fill arc
            // svg.append('path')
            //     .datum(datum)
            //     .attr('d', arc)
            //     .style('fill', mainColor);

            // // Text
            // svg.append('text')
            //     .datum(datum)
            //     .attr('class', 'meter-center-text')
            //     .style('text-anchor', 'middle')
            //     .style('fill', mainColor)
            //     .text(function(d){
            //         return parseFloat(d);
            //     })
            //     .attr('transform', 'translate(' + 0 + ',' + 20 + ')');
            
            
            // Do this when the user scrolls (zoom effect)
			function zoomed() {
				var eventType = d3.event.sourceEvent || 'dblclick';
				if(eventType != 'dblclick'){
				svg
    				.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')');
    			}
			}
        }
    });
});
