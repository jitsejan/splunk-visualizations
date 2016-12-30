// <![CDATA[
// <![CDATA[
//
// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
// 
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/layoutview",
    "splunkjs/mvc/simplexml/dashboardview",
    "splunkjs/mvc/simplexml/dashboard/panelref",
    "splunkjs/mvc/simplexml/element/chart",
    "splunkjs/mvc/simplexml/element/event",
    "splunkjs/mvc/simplexml/element/html",
    "splunkjs/mvc/simplexml/element/list",
    "splunkjs/mvc/simplexml/element/map",
    "splunkjs/mvc/simplexml/element/single",
    "splunkjs/mvc/simplexml/element/table",
    "splunkjs/mvc/simplexml/element/visualization",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simplexml/searcheventhandler",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/linklist",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/simplexml/urltokenmodel",
    "splunkjs/mvc/tableview"
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/tokenforwarder"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        DashboardController,
        LayoutView,
        Dashboard,
        PanelRef,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        VisualizationElement,
        FormUtils,
        EventHandler,
        SearchEventHandler,
        DropdownInput,
        RadioGroupInput,
        LinkListInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        UrlTokenModel,
        TableView

        // Add comma-separated parameter names here, for example: 
        // ...UrlTokenModel, 
        // TokenForwarder
        ) {

        var pageLoading = true;


        // 
        // TOKENS
        //
        
        // Create token namespaces
        var urlTokenModel = new UrlTokenModel();
        mvc.Components.registerInstance('url', urlTokenModel);
        var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
        var submittedTokenModel = mvc.Components.getInstance('submitted', {create: true});

        urlTokenModel.on('url:navigate', function() {
            defaultTokenModel.set(urlTokenModel.toJSON());
            if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
                submitTokens();
            } else {
                submittedTokenModel.clear();
            }
        });

        // Initialize tokens
        defaultTokenModel.set(urlTokenModel.toJSON());

        function submitTokens() {
            // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
            FormUtils.submitForm({ replaceState: pageLoading });
        }

        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }

        function unsetToken(name) {
            defaultTokenModel.unset(name);
            submittedTokenModel.unset(name);
        }

        
        
        //
        // SEARCH MANAGERS
        //

        var search1 = new SearchManager({
            "id": "search1",
            "cancelOnUnload": true,
            "search": "index=jitsejan source=\"*theartstory_artists.csv\" | eval leftbracket=replace(movement,\"\\[\",\"\") | eval movement=replace(leftbracket,\"\\]\",\"\") | makemv delim=\",\" movement  | lookup geo_attr_us_states.csv state_name AS borncountry  | eval state=if(isnotnull(state_code), borncountry, NULL), borncountry=if(isnotnull(state_code), \"United States\", borncountry) | lookup geo_attr_countries.csv country AS borncountry | stats count by borncountry | rename borncountry as Country  | sort -count | geom geo_countries featureIdField=Country",
            "latest_time": "$latest$",
            "status_buckets": 0,
            "sample_ratio": 1,
            "earliest_time": "0",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        var search2 = new SearchManager({
            "id": "search2",
            "cancelOnUnload": true,
            "search": "index=jitsejan source=\"*theartstory_artists.csv\"  | eval leftbracket=replace(movement,\"\\[\",\"\")  | eval movement=replace(leftbracket,\"\\]\",\"\")  | makemv delim=\",\" movement  | lookup geo_attr_us_states.csv state_name AS borncountry  | eval state=if(isnotnull(state_code), borncountry, NULL), borncountry=if(isnotnull(state_code), \"United States\", borncountry)  | lookup geo_attr_countries.csv country AS borncountry  | search borncountry=\"$form.country$\" | table image name bornyear diedyear movement | rename name AS Name, bornyear AS \"Born in\", diedyear AS \"Died in\" movement AS Movement | sort name",
            "latest_time": "$latest$",
            "status_buckets": 0,
            "sample_ratio": 1,
            "earliest_time": "1482263743.000",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        var search3 = new SearchManager({
            "id": "search3",
            "cancelOnUnload": true,
            "search": "index=jitsejan source=\"*theartstory_artists.csv\" name=\"$form.artist$\" | table name bornyear image artworks",
            "latest_time": "$latest$",
            "status_buckets": 0,
            "sample_ratio": 1,
            "earliest_time": "1481714197",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

            
        new SearchEventHandler({
            managerid: "search3",
            event: "finalized",
            conditions: [
                {
                    attr: "any",
                    value: "*",
                    actions: [
                        {"type": "set", "token": "Name", "value": "$result.name$"},
                        {"type": "set", "token": "Picture", "value": "$result.image$"},
                        {"type": "set", "token": "Artworks", "value": "$result.artworks$"}
                    ]
                }
            ]
        });


        //
        // SPLUNK LAYOUT
        //

        $('header').remove();
        new LayoutView({"hideAppBar": false, "hideSplunkBar": false, "hideChrome": false, "hideFooter": true})
            .render()
            .getContainerElement()
            .appendChild($('.dashboard-body')[0]);

        //
        // DASHBOARD EDITOR
        //

        new Dashboard({
            id: 'dashboard',
            el: $('.dashboard-body'),
            showTitle: true,
            editable: true
        }, {tokens: true}).render();


        //
        // VIEWS: VISUALIZATION ELEMENTS
        //

        var element1 = new MapElement({
            "id": "element1",
            "drilldown": "all",
            "mapping.choroplethLayer.showBorder": "1",
            "mapping.tileLayer.minZoom": "0",
            "mapping.markerLayer.markerOpacity": "0.8",
            "mapping.choroplethLayer.minimumColor": "0x2F25BA",
            "mapping.choroplethLayer.colorBins": "6",
            "mapping.choroplethLayer.shapeOpacity": "0.75",
            "mapping.data.maxClusters": "100",
            "mapping.tileLayer.maxZoom": "19",
            "mapping.choroplethLayer.neutralPoint": "0",
            "mapping.markerLayer.markerMinSize": "10",
            "mapping.tileLayer.tileOpacity": "1",
            "mapping.map.scrollZoom": "0",
            "mapping.map.panning": "1",
            "mapping.map.center": "(0,0)",
            "mapping.choroplethLayer.maximumColor": "0xDB5800",
            "mapping.type": "choropleth",
            "mapping.markerLayer.markerMaxSize": "50",
            "mapping.tileLayer.url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "height": "405",
            "mapping.map.zoom": "2",
            "mapping.choroplethLayer.colorMode": "categorical",
            "mapping.showTiles": "1",
            "resizable": true,
            "managerid": "search1",
            "el": $('#element1')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        element1.on("click", function(e) {
            if (e.field !== undefined) {
                e.preventDefault();
                setToken("form.country", TokenUtils.replaceTokenNames("$row.Country$", _.extend(submittedTokenModel.toJSON(), e.data)));
            }
        });

        var element2 = new TableView({
            "id": "element2",
            "managerid": "search2",
            "el": $('#element2')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        element2.on("click", function(e) {
            if (e.field === "Name") {
                e.preventDefault();
                setToken("form.artist", TokenUtils.replaceTokenNames("$row.Name$", _.extend(submittedTokenModel.toJSON(), e.data)));
            } else if (e.field === "Movement") {
                e.preventDefault();
                setToken("form.movement", TokenUtils.replaceTokenNames("$row.Movement$", _.extend(submittedTokenModel.toJSON(), e.data)));
            }
        });

        var element3 = new TableView({
            "id": "element3",
            "managerid": "search3",
            "el": $('#element3')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        var element4 = new HtmlElement({
            "id": "element4",
            "useTokens": true,
            "el": $('#element4')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        DashboardController.addReadyDep(element4.contentLoaded());
        
/*
        
                Define the customization for table cells

        */

        
        // Use the BaseCellRenderer class in TableView to create a custom table cell renderer
            var CustomCellRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cellData) {
                // This method returns "true" for the "image" field
                return cellData.field === "image";
            },

            // This render function only works when canRender returns "true"
            render: function($td, cellData) {
                console.log("cellData: ", cellData);
               $td.html('<img src="'+cellData.value+'" />');
            }
        });

        var myCellRenderer = new CustomCellRenderer();
        element2.addCellRenderer(myCellRenderer);
        element2.render();

        element3.addCellRenderer(myCellRenderer);
		element3.render();

        /*

                End customization

        */

        // Initialize time tokens to default
        if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
            defaultTokenModel.set({ earliest: '0', latest: '' });
        }

        submitTokens();


        //
        // DASHBOARD READY
        //

        DashboardController.ready();
        pageLoading = false;

    }
);
// ]]>