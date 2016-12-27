/* customview.js */
require([
    "/static/app/jitsejan/static/js/demoview.js",
    "splunkjs/mvc/simplexml/ready!"
], function(DemoView) {

    // Create a custom view
    var customView = new DemoView({
        id: "mycustomview",
        el: $("#mycustomview")
    }).render();

});