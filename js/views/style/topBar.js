define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/style/top-bar.html'
],
function($, _, Backbone, template){
	var that = null;
	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-top-bar',
		events: {
			'click .phytoplankton-menu-icon': function() {
				$('.js-phytoplankton-menu').toggleClass('is-active');
				$('body').toggleClass('is-opaque is-locked');
			}
		},
		render: function () {
			this.$el.html(_.template(template));

			return this;
		}
	});
	return StylePage;
});
