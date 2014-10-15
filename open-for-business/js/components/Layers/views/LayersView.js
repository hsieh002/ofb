/* global define, Backbone, _, getAppPath */
define([
		'dojo/text!../templates/LayersViewTemplate.html',
		'dojo/on',
		'dojo/_base/lang',
		'dojo/topic',
		'esri/dijit/PopupTemplate',
		'esri/layers/FeatureLayer',
		'esri/layers/LabelLayer',
		'esri/renderers/SimpleRenderer',

		'app/custom/ACSLayer'
	],

	function(viewTemplate, on, lang, topic, PopupTemplate, FeatureLayer, LabelLayer, SimpleRenderer, ACSLayer) {
		var GeocoderView = Backbone.View.extend({

			events: {
				'change input[name=layersRadios]': 'layersRadios_ChangedHandler'
			},

			initialize: function() {
				this.layerController = this.options.layerController;
				this.map = this.options.map;
				this.config = this.options.config;

				this.VARIABLE_ID = 'B01001_001E';
				this.VARIABLE_NAME = 'Total Population';
				this.TRACT_ID = 'GEOID';
				this.COLOR = this.config.colorRamps.green;
				this.MIN_SCALE = 1000000;

				this.render();
			},

			render: function() {
				var template = _.template(viewTemplate, {
					layers: this.config.dataLayers
				});
				this.$el.html(template);

				this.startup();
			},

			startup: function() {
				this._addDataLayer();
				this._addCountiesLayer();
				this._addReportLink();
			},

			/**
			 * Event Handlers
			 */

			layersRadios_ChangedHandler: function(e) {
				var target = e.currentTarget || e.srcElement,
					variable,
					api,
					apiName;

				apiName = _.findWhere(this.config.dataLayers, {
					code: target.value
				}).api;

				api = this.config.dataApis[apiName];

				variable = {
					id: target.value,
					name: this._getAttribute(target, 'data-name'),
					apiUrl: api
				};

				this.layer.setVariable(variable);
				this.layer.setColor(this.config.colorRamps[this._getAttribute(target, 'data-color')]);

				window.ofb.store.parameter = variable;

				var template = this._getInfoTemplate(target.value, this._getAttribute(target, 'data-name'), this.TRACT_ID);
				this.layer.setInfoTemplate(template);
			},

			reportLink_ClickHandler: function(e) {
				var countyFips = this.map.infoWindow.getSelectedFeature().attributes.GEOID.substr(0, 5),
					url = this.config.reportServiceUrl,
					naics,
					fips,
					queryString = [];

				naics = 'naicsId=' + window.ofb.store.naics;
				fips = 'countyId=' + countyFips;

				queryString.push(naics);
				queryString.push(fips);

				window.open(url + '?' + queryString.join('&'));
			},

			/**
			 * Private Methods
			 */

			_addDataLayer: function() {
				var layerName = 'ACS Layer',
					url = this.config.tractLayerUrl;

				var template = this._getInfoTemplate(this.VARIABLE_ID, this.VARIABLE_NAME, this.TRACT_ID);

				this.layer = new ACSLayer(url, {
					id: 'tracts',
					name: 'tracts',
					outFields: ['STATE'],
					tractField: this.TRACT_ID,
					variableId: this.VARIABLE_ID,
					variableName: this.VARIABLE_NAME,
					colorRamp: this.COLOR,
					infoTemplate: template
				});

				this.layer.setMinScale(this.MIN_SCALE);

				on(this.layer, 'acs-update-end', function() {
					topic.publish('Legend/update-legend');
				});

				this.layerController.addLayerToMap(this.layer, layerName, 99);
			},

			_addCountiesLayer: function() {
				var counties,
					layerName = 'County Layer',
					labelField = 'BASENAME',
					url = this.config.countyLayerUrl;

				counties = new FeatureLayer(url, {
					id: 'counties',
					name: 'counties',
					outFields: [labelField]
				});

				counties.setMinScale(this.MIN_SCALE);
				counties.setMaxScale(0);
				counties.setRenderer(new SimpleRenderer(this.config.countiesLayerRenderer));

				// create a text symbol to define the style of labels
				var statesLabelRenderer = new SimpleRenderer(this.config.countiesLabelRenderer);
				var labels = new LabelLayer({
					id: 'labels'
				});
				// tell the label layer to label the countries feature layer 
				// using the field named 'admin'
				labels.addFeatureLayer(counties, statesLabelRenderer, '{' + labelField + '}');
				// add the label layer to the map
				this.layerController.addLayerToMap(labels, layerName, 99);
				this.layerController.addLayerToMap(counties, layerName, 99);
			},

			_addReportLink: function() {
				var reportLink;

				reportLink = $('<a>', {
					html: 'Get Local Area Profile'
				}).appendTo($('.actionList', this.map.infoWindow.domNode)[0]);
				reportLink.on('click', lang.hitch(this, this.reportLink_ClickHandler));

			},

			/**
			 * Return an attribute value. Originally supported HTML5 data API but
			 * need to support legacy IE browsers keeps us from doing that
			 * @param  { Element } element   Element to query
			 * @param  { String } attribute Attribute name
			 * @return { String }           Attribute value
			 */
			_getAttribute: function(element, attribute) {

				return element.getAttribute(attribute);

				// var isNotIe = true;
				// if (isNotIe) {
				// 	// Non-IE method (attribute has been camelized)
				// 	return element.dataset[this.GENERAL_BUSINESS_AREA];
				// } else {
				// 	// IE method (attribute is exactly as it appears in the html)
				// 	return element.getAttribute(attribute);
				// }
			},

			_getInfoTemplate: function(variableId, variableName, tractId) {
				var template = new PopupTemplate({
					title: 'Tract: {' + tractId + '}',
					description: 'The ' + variableName + ' for this tract is: {' + variableId + ':NumberFormat}',
					fieldInfos: [{
						fieldName: variableId,
						label: variableName
					}, {
						fieldName: tractId,
						label: 'Tract'
					}]
				});
				return template;
			}

		});
		return GeocoderView;
	});