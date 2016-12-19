define([
	'jquery',
	'underscore',
	'libs/underscore/underscore.string.min',
	'backbone',
	'marked',
	'text!templates/style/menu.html',
	'config'
],
function($, _, str, Backbone, marked, dashboardPageTemplate, config) {
	var DashboardPage = Backbone.View.extend({
		el: '.js-phytoplankton-menu',
		events: {
			'click .js-phytoplankton-menu__list__item__subheader': function (ev) {
				if ($(ev.currentTarget).hasClass('is-active')) {
					ev.preventDefault();
				} else {
					this.$el.find('.is-active').removeClass('is-active');
					$(ev.currentTarget).addClass('is-active');
					$(ev.currentTarget).parent().find('li:first-child').addClass('is-active');
				}
			},
			'click .js-phytoplankton-menu__list__item a': function() {
				$('.js-phytoplankton-menu').removeClass('is-active');
				$('.js-phytoplankton-menu-icon').removeClass('is-active');
				$('.js-phytoplankton-header').removeClass('is-active');
				$('.js-phytoplankton-page').removeClass('is-active');
				$('.js-phytoplankton-page').removeClass('is-opaque');
			}
		},
		render: function() {
			var that = this;
			that.$el.html('Loading styles');

			var menus = [];
			var currentMenu = {
				title: '',
                sheets: []
			};

			// Creates menu from config.js
			_.each(config.menu, function(data) {
				currentMenu.title = data.title;
				currentMenu.sheets = [];
				_.each(data.url, function(url) {
					currentMenu.sheets.push(url);
				});
				menus.push(_.extend({}, currentMenu));
			});

			this.$el.html(_.template(dashboardPageTemplate)({menus:menus}));

			// Adds .active class to the actual page's menu.
			$('[href="' + window.location.hash + '"]').addClass('is-active');
		}
	});

	return DashboardPage;
});
