/* global define, Backbone, _ */
define([
		'dojo/text!../templates/SelectorViewTemplate.html',
		'./GeneralBusinessAreaView',
		'./PrimaryBusinessAreaView',

		'dojo/topic',
		'dojo/_base/lang'
	],

	function(viewTemplate, GeneralView, PrimaryView, topic, lang) {
		var LegendView = Backbone.View.extend({

			events: {
				'click .general-ba a': 'generalBa_ClickHandler',
				'click .primary-ba a': 'primaryBa_ClickHandler',
				'click .btn-reset': 'reset_ClickHandler'
			},

			initialize: function() {
				this.config = this.options.config;
				this.mapInterface = this.options.mapInterface;

				this.naics = '';
				this.areas = {
					general: [],
					primary: []
				};

				this.GENERAL_BUSINESS_AREA = 'data-general-ba';
				this.NAICS = 'data-naics';
				this.GENERAL_GUIDELINE = 'To begin, please choose your general business area:';
				this.PRIMARY_GUIDELINE = 'Now choose your primary business area:';

				this.render();
			},

			render: function(init) {
				var template = _.template(viewTemplate, {
					guideline: this.GENERAL_GUIDELINE,
					feedbackTo: this.config.feedback.to
				});
				this.$el.html(template);

				this.startup();

				return this;
			},

			startup: function() {
				var subview;
				// On startup, add general business area options
                this.$el.find('.show-links').show();
				_.each(this.config.businessAreas, lang.hitch(this, function(gba) {
					subview = new GeneralView({
						name: gba.name,
						key: gba.key,
						icon: gba.icon,
						hover: gba.hoverIcon
					});
					this.areas.general.push(subview);
					this.$el.find('.ba-selectors').append(subview.$el);
				}));

			},

			/**
			 * Event Handlers
			 */

			generalBa_ClickHandler: function(e) {
				var target = e.currentTarget || e.srcElement,
					subview,
					generalBa;

				// generalBa = target.dataset[this.GENERAL_BUSINESS_AREA];
				generalBa = this._getAttribute(target, this.GENERAL_BUSINESS_AREA);
				window.ofb.store.gba = target.title;

				this.$el.find('.ba-selectors').empty();

				_.each(this.config.businessAreas[generalBa].naics, lang.hitch(this, function(pba) {
					subview = new PrimaryView({
						name: pba.name,
						icon: pba.icon,
						hover: pba.hoverIcon,
						naics: pba.code
					});
					this.areas.primary.push(subview);
					this.$el.find('.ba-selectors').append(subview.$el);
				}));

				this.$el.find('.guideline-text').text(this.PRIMARY_GUIDELINE);

				// Show back button
				this.$el.find('.reset-selectors button').show();

			},

			primaryBa_ClickHandler: function(e) {
				var target = e.currentTarget || e.srcElement;

				// Save to namespace (for demo)
				// window.ofb.store.naics = target.dataset[this.NAICS];
				window.ofb.store.naics = this._getAttribute(target, this.NAICS);
				window.ofb.store.pba = target.title;

				this._updateBreadcrumbs();

				// Hide general business areas, show map and external tools
				this.$el.find('.ba-selectors').hide();
				this.$el.find('.guideline-text').hide();
				this.$el.find('.show-with-map').show();
				this._showMap();
			},

			reset_ClickHandler: function(e) {
				this.$el.find('.ba-selectors').empty();

				_.each(this.areas.general, lang.hitch(this, function(subview) {
					this.$el.find('.ba-selectors').append(subview.$el);
				}));

				this.$el.find('.guideline-text').text(this.GENERAL_GUIDELINE);

				// Hide map
				this.mapInterface.hide();
				// Hide back button
				this.$el.find('.reset-selectors button').hide();
				this.$el.find('.show-with-map').hide();
				// Show guide text
				this.$el.find('.guideline-text').show();
				// Show selectors
				this.$el.find('.ba-selectors').show();
			},

			/**
			 * Private Methods
			 */

			_showMap: function() {
				this.mapInterface.show();
				topic.publish('MapController/show');
			},

			_updateBreadcrumbs: function() {
				var store;
				store = window.ofb.store;
				this.$el.find('.breadcrumbs').html(store.gba + ' > ' + store.pba);
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
			}

		});
		return LegendView;
	});