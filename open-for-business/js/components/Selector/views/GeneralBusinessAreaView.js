/* global define, Backbone, _ */
define([
		'dojo/text!../templates/GeneralBusinessAreaViewTemplate.html',
		'dojo/topic',
		'dojo/_base/lang'
	],

	function(viewTemplate, topic, lang) {
		var GeneralBusinessAreaView = Backbone.View.extend({

			events: {
			},

			initialize: function() {
				this.render();
			},

			render: function(init) {
				var template = _.template(viewTemplate, {
					name: this.options.name,
					key: this.options.key,
					icon: this.options.icon,
					hover: this.options.hover
				});
				this.$el.html(template);

				this.startup();

				return this;
			},

			startup: function() {
			}

			/**
			 * Event Handlers
			 */


			/**
			 * Private Methods
			 */

		});
		return GeneralBusinessAreaView;
	});