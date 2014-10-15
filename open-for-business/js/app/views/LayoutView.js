/* global define, Backbone, _ */
define([
		'dojo/text!../templates/LayoutViewTemplate.html',
		'dojo/topic',
		'esri/map'
	],

	function(viewTemplate, topic, Map) {
		var LayoutView = Backbone.View.extend({

			events: {
				'click .general-business-areas a': 'generalBusinessArea_ClickHandler',
				'click .primary-business-areas a': 'primaryBusinessArea_ClickHandler'
			},

			initialize: function() {

				this.GENERAL_BUSINESS_AREA = 'generalBa';
				this.PRIMARY_BUSINESS_AREA = 'primaryBa';

				this.render();
			},

			render: function() {
				var template = _.template(viewTemplate);
				this.$el.html(template);

				return this;
			},

			/**
			 * Event Handlers
			 */

			generalBusinessArea_ClickHandler: function(e) {
				var target = e.currentTarget || e.srcElement;

				// Save to namespace (for demo)
				window.ofb.store.generalBA = target.dataset[this.GENERAL_BUSINESS_AREA];

				// Hide general business areas, show primary
				this.$el.find('.general-business-areas').hide();
				this.$el.find('.primary-business-areas').show();

				// Populate primary business area icons based on selection
				var iconElements = [];

				// TODO: Push necessary elements into array based on target that was clicked.

				$('.primary-business-areas').append(iconElements);
			},

			primaryBusinessArea_ClickHandler: function(e) {
				var target = e.currentTarget || e.srcElement;

				// Save to namespace (for demo)
				window.ofb.store.primaryBA = target.dataset[this.PRIMARY_BUSINESS_AREA];

				// Hide general business areas, show primary
				this.$el.find('.primary-business-areas').hide();
				this.$el.find('.external-tools').show();
				this._showMap();
			},

			/**
			 * Private Methods
			 */

			_showMap: function() {
				this.$el.find('.map-interface').show();
				topic.publish('MapController/show');
			}


		});
		return LayoutView;
	});