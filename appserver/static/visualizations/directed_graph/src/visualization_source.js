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
            
            var nodes = [];
            var links = [];
            var counter = 0;
            var uniqueNames = [];

            rows.forEach( function(row) {
                var sourceName = row[0];
                var targetName = row[1];
                var categoryName = row[2];
                var nodeSize = row[3] || 5;
                
                if($.inArray(sourceName, uniqueNames) == -1){
                    nodes.push({'id': counter, 'name': sourceName, 'group': categoryName});
                    uniqueNames.push(sourceName);
                    counter = counter + 1;
                }

                if($.inArray(targetName, uniqueNames) == -1){
                    nodes.push({'id': counter, 'name': targetName, 'group': categoryName, 'size': nodeSize});
                    uniqueNames.push(targetName);
                    counter = counter + 1;
                }
            });

			rows.forEach( function(row, i) {
				link = {
					'source': $.grep(nodes, function(element, index){ return element.name === rows[i][0]; })[0]['id'],
					'target': $.grep(nodes, function(element, index){ return element.name === rows[i][1]; })[0]['id'],
					'weight': 1
				};
				links.push(link);
            });

            console.log('nodes', nodes);
            console.log('links', links);

            return {nodes: nodes, links: links};
        },
  
        updateView: function(data, config) {
             
            // Check for an empty data object
			if(data.nodes.length < 1){
				return false;
			}
       
            // Clear the div
            this.$el.empty();
            
            var width = 1400;
            var height = 800;
            
            // Create the canvas
			var svg = d3.select(this.el)
						.append('svg')
							.style('width', width + 'px')
							.style('height', height + 'px')
							.style('margin', '0 auto');

            // Add a g and make it the active svg component
			svg = svg.append('g');

            var color = d3.scaleOrdinal(d3.schemeCategory20);

            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().distance(10).strength(0.5))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));
            
            var link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(data.links)
                .enter().append('line')
                            .attr('stroke', "ff00ff")
                            .attr('fill', 'red')
                            .attr('stroke-width', 2);
            
            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(data.nodes)
                .enter().append("circle")
                            .attr("r", function(d) {return 5 + (parseInt(d.size)/10) || 5;})
                            .attr("fill", function(d) { return color(d.group); })
                            .call(d3.drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended));

            // Add a title to the nodes (hover to show)
	  		node
	  			.append('title')
	  			.text(function(d) { return d.name; });

            simulation
                .nodes(data.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(data.links);

            function ticked() {
                link
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
       }
    });
});
