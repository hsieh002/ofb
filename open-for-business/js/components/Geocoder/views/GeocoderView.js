/* global define, Backbone, _, getAppPath */
define([
		'dojo/text!../templates/GeocoderViewTemplate.html',
		'esri/dijit/Geocoder',
		'esri/dijit/LocateButton',
		'esri/layers/GraphicsLayer',
		'esri/symbols/PictureMarkerSymbol',
		'esri/graphic',
		'esri/InfoTemplate',
		'dojo/_base/fx',
		'dojo/on',
		'dojo/_base/lang'
	],

	function(viewTemplate, Geocoder, LocateButton, GraphicsLayer, PictureMarkerSymbol, Graphic, InfoTemplate, fx, on, lang) {
		var GeocoderView = Backbone.View.extend({

			events: {
				'keypress #esriGeocoder_input': 'esriGeocoder_KeypressHandler',
				'click .esriGeocoderReset': 'geocoderReset_ClickHandler'
			},

			initialize: function() {
				this.map = this.options.map;

				this.MAP_LEVEL = 14;
				this.SYMBOL = new PictureMarkerSymbol('./assets/img/pin.svg', 28.5, 57);
				this.SYMBOL.setOffset(0, 28.5);
				this.render();
			},

			render: function() {
				var template = _.template(viewTemplate)();
				this.$el.html(template);

				this.startup();
			},

			startup: function() {

				this.geocodeResultsLayer = new GraphicsLayer({
					id: 'geocodeResultsLayer'
				});

				this.map.addLayer(this.geocodeResultsLayer);


				this.geolocator = new LocateButton({
					map: this.map,
					centerAt: true,
					highlightLocation: false,
					scale: 40000
				}, 'esriGeolocator');

				this.geocoder = new Geocoder({
					autoNavigate: false,
					autoComplete: true,
					outFields: 'Match_Addr',
					arcgisGeocoder: {
						sourceCountry: 'USA',
						placeholder: 'Find a location',
						localSearchOptions: {
							minScale: 300000,
							distance: 50000
						}
					},
					map: this.map
				}, 'esriGeocoder');

				//hack to make sure more fields are returned w/ geocode response
				this.geocoder._geocoders[0].outFields = ['*'];

				this.geolocator.on('locate', lang.hitch(this, this.handleGeocodeResults));

				this.geocoder.on('select', lang.hitch(this, this.handleGeocodeResults));
				this.geocoder.on('find-results', lang.hitch(this, this.handleGeocodeResults));

				this.geolocator.startup();
				this.geocoder.startup();
			},

			esriGeocoder_KeypressHandler: function(e) {
				if (e.keyCode === 13) {
					e.preventDefault();
				}
			},

			geocoderReset_ClickHandler: function(e) {
				this.geocodeResultsLayer.clear();
			},

			handleGeocodeResults: function(response) {

				// handle "Position Unavailable"
				if (response.error) {
					window.alert('Your browser or device was unable to locate you, returning the folowing message: ' + response.error.message);
				}

				var graphic;

				this.geocodeResultsLayer.clear();

				if (response.position) {
					// geolocator response
					graphic = new Graphic(response.graphic.geometry, this.SYMBOL);
					this._addSymbol(this.geocodeResultsLayer, graphic);
				} else if (response.result) {
					// geocoder response
					graphic = new Graphic(response.result.feature.geometry, this.SYMBOL);
					if (graphic) {
						this._zoomToResult(graphic, this.MAP_LEVEL, function() {
							this._addSymbol(this.geocodeResultsLayer, graphic);
							this.map.getLayer('tracts').refresh();
						});
					}
				}

			},

			_addSymbol: function(lyr, graphic) {
				var addedGraphic,
					shp;

				if (graphic) {
					addedGraphic = lyr.add(graphic);
					shp = addedGraphic.getDojoShape();
					if (shp) {
						shp.rawNode.style.opacity = 0;
						addedGraphic.dojoNode = shp.rawNode;
						fx.fadeIn({
							node: shp.rawNode,
							duration: 500
						}).play();
					}
				}
			},

			_zoomToResult: function(graphic, level, cb) {
				var zoom = this.map.centerAndZoom(graphic.geometry, level);
				zoom.then(lang.hitch(this, cb));
			}
		});
		return GeocoderView;
	});