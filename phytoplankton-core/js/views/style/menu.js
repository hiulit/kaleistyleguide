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
				if($(ev.currentTarget).hasClass('is-active')) {
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
			// 'click .phytoplankton-menu__list__item ul li ul li a': function(ev) {
			// 	ev.preventDefault();
			// 	var pageHeadingHeight = $('.phytoplankton-page__header').outerHeight();
			// 	var scrollAnchor = $(ev.currentTarget).attr('href');
			// 	scrollAnchor = scrollAnchor.substr(scrollAnchor.lastIndexOf('#') + 1);
			// 	var scrollPoint = $('.phytoplankton-page__item *[id="' + scrollAnchor + '"]').offset().top - (pageHeadingHeight + 48);
			// 	$('html, body').animate({
			// 		scrollTop: scrollPoint
			// 	}, '200');
			// }
		},
		render: function () {

			var that = this;

			that.$el.html('Loading styles');

			var menus = [];
			var currentMenu = {
				sheets: [],
				title: ''
			};
			var sheetPath;

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
			$('[href="' + window.location.hash + '"]').addClass('active');
		}
	});
	return DashboardPage;
});