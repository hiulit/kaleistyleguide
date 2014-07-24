define([
	'jquery',
	'underscore',
	'backbone',
	'vm',
	'events',
	'text!templates/layout.html'
], function($, _, Backbone, Vm, Events, layoutTemplate){
	var AppView = Backbone.View.extend({
		el: '.js-phytoplankton',
		render: function () {
			var that = this;
			$(this.el).html(layoutTemplate);
			require(['views/style/menu'], function (StyleMenuView) {
				var styleMenuView = Vm.create(that, 'StyleMenuView', StyleMenuView);
				styleMenuView.render();
			});
			require(['views/style/topBar'], function (styleTopBarView) {
				var styleTopBarView = Vm.create(that, 'styleTopBarView', styleTopBarView);
				styleTopBarView.render();
			});
		}
	});
	return AppView;
});
