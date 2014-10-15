/* global define, Backbone, _ */
define([
		'dojo/text!../templates/LegendViewTemplate.html',
		'esri/dijit/Legend',
		'dojo/i18n!esri/nls/jsapi',
		'dojo/topic',
		'dojo/_base/lang'
	],

	function(viewTemplate, Legend, bundle, topic, lang) {
		var LegendView = Backbone.View.extend({

			events: {
				'click .legend-header': 'legendHeader_ClickHandler' // To show/hide the legend
			},

			initialize: function() {
				this.config = this.options.config;
				this.layerController = this.options.layerController;

				topic.subscribe('Legend/update-legend', lang.hitch(this, this.updateLegend_Handler));

				this.render();
			},

			render: function(init) {
				var template = _.template(viewTemplate);
				this.$el.html(template);

				this.startup();

				return this;
			},

			startup: function() {
				// Override 'No Legend' text
				bundle.widgets.legend.NLS_noLegend = 'No visible layers to display.';

				this.layerList = [{
					layer: this.layerController.getLayerById('tracts'),
					title: ''
				}];

				this.legend = new Legend({
					layerInfos: this.layerList,
					map: this.options.map
				}, this.$el.find('#esriLegend').attr('id'));
				this.legend.startup();
			},

			/**
			 * Event Handlers
			 */

			updateLegend_Handler: function() {
				this._updateLayerList();
				this.legend.refresh();
			},

			/**
			 * Private Methods
			 */

			_updateLayerList: function() {
				if (window.ofb.store.parameter) {
					this.legend.layerInfos[0].title = window.ofb.store.parameter.name;
				} else {
					this.legend.layerInfos[0].title = _.findWhere(this.config.dataLayers, {
						'default': true
					}).name;
				}
			},

			_cleanLegend: function() {

			}
		});
		return LegendView;
	});