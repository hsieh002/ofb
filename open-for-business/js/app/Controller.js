/* global define, Backbone, app:true, _ */
define([
		'config/config',
		'app/utils/LayerController',
		'app/utils/Query',
		'app/utils/MapController',
		'app/views/LayoutView',

		'components/Geocoder/views/GeocoderView',
		'components/Legend/views/LegendView',
		'components/Layers/views/LayersView',
		'components/Selector/views/SelectorView',

		'dojo/_base/lang',
		'dojo/on',

		'esri/config',
		'esri/arcgis/utils',
		'esri/urlUtils',
		'esri/tasks/GeometryService'
	],

	function(appConfig, LayerControllerUtil, QueryUtil, MapController, Layout,
		Geocoder, Legend, Layers, Selector,
		lang, on,
		esriConfig, arcgisUtils, urlUtils, GeometryService) {
		return {

			/**
			 * This is the entry point for the application, called from index.html
			 * @return { N/A }
			 */
			startup: function() {
				app = this; //debug

				// setup global namespace
				window.ofb = {};
				window.ofb.store = {};

				this.initConfig();
                
                app.gaveFeedback = false;
                
                function promptForFeedback() {
                    if (!app.gaveFeedback) {
                        return "Your feedback is important to us, please consider leaving feedback.";
                    }
                }
                
                window.onbeforeunload = promptForFeedback;
                
			},

			/**
			 * Initialize esri configuration settings
			 * @return { N/A }
			 */
			initConfig: function() {
				this.appConfig = appConfig;

				function isIe() {
					return navigator.userAgent.indexOf('MSIE') !== -1;
				}

				// NOTE: App doesn't work for Andy H without proxy, so just force it to be used all the time...
				esriConfig.defaults.io.proxyUrl = appConfig.proxy.url;
				esriConfig.defaults.io.alwaysUseProxy = appConfig.proxy.alwaysUseProxy;

				// Only use proxy if browser doesn't support CORS
				// if (isIe()) {
				// 	esriConfig.defaults.io.proxyUrl = appConfig.proxy.url;
				// 	esriConfig.defaults.io.alwaysUseProxy = appConfig.proxy.alwaysUseProxy;
				// }

				esriConfig.defaults.geometryService = new GeometryService(appConfig.geometryService.url);
				this.initLayout();
			},

			/**
			 * Initialize the application layout by inserting top level nodes into the DOM
			 * @return { N/A }
			 */
			initLayout: function() {
				this.layout = new Layout({
					el: $('body'),
					config: this.appConfig
				});

				this.initMap();
			},

			/**
			 * Initialize the map and place it in 'mapContainer'
			 * @return { N/A }
			 */
			initMap: function() {
				this.mapController = new MapController();
				this.mapController.startup(this.appConfig);
				this.map = this.mapController.createMap('mapContainer');
				this.initLayerController();
			},

			/**
			 * Initialize LayerController utility class to manage map layers
			 * @return { N/A }
			 */
			initLayerController: function() {
				this.layerController = new LayerControllerUtil();
				this.layerController.startup(this.appConfig, this.map, this.mapController);
				this.initComponents();
			},

			/**
			 * Initialize components of the application, this is the last responsibility of the Controller
			 * @return { N/A }
			 */
			initComponents: function() {
				// Selector
				this.baSelector = new Selector({
					el: this.layout.$el.find('.ba-selector'),
					mapInterface: this.layout.$el.find('.map-interface'),
					config: this.appConfig
				});

				// // Layers
				this.layers = new Layers({
					el: this.layout.$el.find('.layers-container'),
					map: this.map,
					layerController: this.layerController,
					config: this.appConfig
				});

				// Legend
				this.legend = new Legend({
					el: this.layout.$el.find('.legend-container'),
					map: this.map,
					layerController: this.layerController,
					config: this.appConfig
				});

				// Geocoder
				this.geocoder = new Geocoder({
					el: this.layout.$el.find('.geocoder-container'),
					map: this.map
				});
			}
		};
	}
);