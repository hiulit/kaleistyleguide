define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/style/top-bar.html'
],
function($, _, Backbone, template){
	var that = null;
	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-header',
		events: {
			'click .phytoplankton-menu-icon': function() {
				$('.js-phytoplankton-menu').toggleClass('is-active');
				$('.js-phytoplankton-menu-icon').toggleClass('is-active');
				$('.js-phytoplankton-header').toggleClass('is-active');
				$('.js-phytoplankton-page').toggleClass('is-active is-opaque');
			}
		},
		render: function () {
			this.$el.html(_.template(template));

			return this;
		}
	});
	return StylePage;
});
