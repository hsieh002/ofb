/* global define, Backbone, _ */
define([
		'dojo/text!../templates/PrimaryBusinessAreaViewTemplate.html',
		'dojo/topic',
		'dojo/_base/lang'
	],

	function(viewTemplate, topic, lang) {
		var PrimaryBusinessAreaView = Backbone.View.extend({

			events: {},

			initialize: function() {
				this.render();
			},

			render: function(init) {
				var template = _.template(viewTemplate, {
					name: this.options.name,
					naics: this.options.naics,
					icon: this.options.icon,
					hover: this.options.hover
				});
				this.$el.html(template);

				this.startup();

				return this;
			},

			startup: function() {}

			/**
			 * Event Handlers
			 */


			/**
			 * Private Methods
			 */

		});
		return PrimaryBusinessAreaView;
	});