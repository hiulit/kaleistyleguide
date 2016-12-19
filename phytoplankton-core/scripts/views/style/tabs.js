define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/style/tabs.html'
],
function($, _, Backbone, template){
	var that = null;
	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-tabs',
		events: {
		},
		render: function () {
			this.$el.html(_.template(template));

			return this;
		}
	});
	return StylePage;
});
