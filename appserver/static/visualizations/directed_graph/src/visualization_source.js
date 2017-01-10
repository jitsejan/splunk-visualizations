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
            console.log('nodes', nodes);
            return {nodes: nodes, links: links};
        },
  
        updateView: function(data, config) {
             
            // Check for an empty data object
			if(data.nodes.length < 1){
				return false;
			}
       
            // Clear the div
            this.$el.empty();
            
            var height = 500;
            var width = 600;

            var mainColor = config[this.getPropertyNamespaceInfo().propertyNamespace + 'mainColor'] || '#f7bc38';

            var force = d3.layout.force()
                                .nodes(d3.values(data.nodes))
                                .links(data.links)
                                .size([width-10, height-10])
                                .linkDistance(60)
                                .charge(-375)
                                .on("tick", tick)
                                .start();

            // Create the canvas
			var svg = d3.select(this.el)
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

            // build the arrow.
            svg.append("svg:defs").selectAll("marker")
                .data(["end"])
                .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            // add the links and the arrows
            var path = svg.append("svg:g").selectAll("path")
                .data(force.links())
                .enter().append("svg:path")
                .attr("class", "link")
                .attr("marker-end", "url(#end)");

            // define the nodes
            var node = svg.selectAll(".node")
                .data(force.nodes())
            .enter().append("g")
                .attr("class", "node")
                .call(force.drag);

            // add the nodes
            node.append("circle")
                .attr("r", 5);

            // add the text 
            node.append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function(d) { return d.name; });

            // add the curvy lines
            function tick() {
                path.attr("d", function(d) {
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + 
                        d.source.x + "," + 
                        d.source.y + "A" + 
                        dr + "," + dr + " 0 0,1 " + 
                        d.target.x + "," + 
                        d.target.y;
                });

                node
                    .attr("transform", function(d) { 
                        return "translate(" + d.x + "," + d.y + ")"; });
            }

			// Add a g and make it the active svg component
			svg = svg.append('g');

                 
        }
    });
});
