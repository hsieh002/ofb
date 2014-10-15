/* global define, _ */
define([
		'esri/geometry/webMercatorUtils',
		'esri/graphicsUtils',
		'dojo/topic',
		'dojo/_base/lang',
		'dojo/on'
	],

	function(webMercatorUtils, graphicsUtils, topic, lang, on) {
		return function LayerController() {

			this.startup = function(config, map, layerLookup) {
				// Variables
				this.config = config;
				this.map = map;
				this.layerLookup = layerLookup;

				this.currentZoomLevel = this.map.getZoom();
				this.graphicsLayers = null;
			};

			this.setGraphicsLayers = function(graphicsLayers) {
				this.graphicsLayers = graphicsLayers;
			};

			this.deactivateLayer = function() {
				this.hideAllLayers();
			};

			this.hideAllLayers = function() {
				_.each(this.layerLookup, lang.hitch(this, function(layer) {
					layer.layerObject.setVisibility(false);
				}));
				this.toggleGraphicsLayers(false);
			};

			// hide an array of layers
			this.hideLayers = function(layers) {
				_.each(layers, function(layer) {
					layer.layerObject.setVisibility(false);
				}, this);
			};

			// show an array of layers
			this.showLayers = function(layers) {
				_.each(layers, function(layer) {
					layer.layerObject.setVisibility(true);
				}, this);
			};

			this.toggleGraphicsLayers = function(visible) {
				_.each(this.graphicsLayers, lang.hitch(this, function(layer) {
					this.map.getLayer(layer).setVisibility(visible);
				}));
			};

			this.getLayerCollection = function() {
				return this.layerLookup;
			};

			this.toggleVisibility = function(layerId, isVisible) {
				var layer = this.getLayerById(layerId);
				if (layer !== null) {
					layer.layerObject.setVisibility(isVisible);
				}
			};

			this.getLayerById = function(layerId) {
				return this.map.getLayer(layerId);
			};

			this.addLayerToMap = function(layer, layerName, extent) {
				on.once(this.map, 'layer-add-result', lang.hitch(this, function(layer) {

					if (layer.error) {
						// There was an error with the map service, notify user and stop processing
						window.alert('There was an error with the layer\'s data source, it is unavailable at this time.');
					} else {
						var lyrExtent = extent;

						if (!layer.layer.name) {
							layer.layer.name = layerName;
						}

						if (!extent && layer.layer.fullExtent) {
							lyrExtent = webMercatorUtils.geographicToWebMercator(layer.layer.fullExtent);
						}

						topic.publish('LayerList/add-user-layer', null, layer.layer, null, true);
						// this.map.setExtent(lyrExtent.expand(1.25), true);
					}
				}));

				this.map.addLayer(layer, 99);
			};
		};
	});