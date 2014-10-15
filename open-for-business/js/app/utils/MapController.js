/* global define, _ */
define([
		'dojo/topic',
		'dojo/_base/lang',
		'dojo/on',
		'esri/map',
		'esri/dijit/HomeButton',
		'esri/symbols/SimpleFillSymbol',
		'esri/geometry/Extent',
		'esri/dijit/Popup',
		'esri/Color',
		'dojo/dom-construct'
	],

	function(topic, lang, on, Map, HomeButton, SimpleFillSymbol, Extent, Popup, Color, domConstruct) {
		return function MapController() {

			this.startup = function(config) {
				this.config = config;

				topic.subscribe('MapController/show', lang.hitch(this, this.map_ShowHandler));
			};

			this.createMap = function(divId) {
				var popup = this._getPopup();
				this.map = new Map(divId, {
					basemap: this.config.map.basemap,
					center: this.config.map.center,
					zoom: this.config.map.zoom,
					minZoom: 4,
					infoWindow: popup
				});

				// workaround to get map to size properly on load.. but then hide
				$('.map-interface').hide();
				$('.map-interface').css('opacity', 1);

				// Hide/show notification to zoom in for data
				this.map.on('zoom-end', function(e) {
					if (e.level < 10) {
						$('.map-notify div').removeClass('flip-up');
					} else {
						$('.map-notify div').addClass('flip-up');
					}
				});

				this._addMapWidgets();
				return this.map;
			};

			this.resize = function() {
				this.map.resize();
			};

			this.zoomToHome = function() {
				this.homeButton.home();
			};

			this.setExtent = function(extent) {
				this.map.setExtent(extent);
			};

			this.getInfoWindow = function() {
				return this.map.infoWindow;
			};

			this._addMapWidgets = function() {
				this.homeButton = new HomeButton({
					theme: 'homeButton',
					map: this.map,
					visible: true
				}, 'homeButton');
				this.homeButton.startup();
				$('#homeButton span').remove();
			};

			this._getPopup = function() {
				// var fill = new SimpleFillSymbol('solid', null, new Color('#A4CE67'));
				var popup = new Popup({
					titleInBody: false
				}, domConstruct.create('div'));

				return popup;
			};

			this.map_ShowHandler = function() {
				this.resize();
			};
		};
	});