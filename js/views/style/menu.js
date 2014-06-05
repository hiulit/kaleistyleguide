define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/style/menu.html',
	'jscssp',
	'config',
	'libs/marked/marked'
],
function($, _, Backbone, dashboardPageTemplate, jscssp, config, marked) {
	var DashboardPage = Backbone.View.extend({
		el: '.js-phytoplankton-menu',
		render: function () {

			var that = this;

			that.$el.html('Loading styles');

			var page = {blocks:[]};

			require(['text!' + config.css_path], function (styles) {
				// Default "imports.css"
				var markedOpts = _.extend({
										sanitize: false,
										gfm: true
									},
									config.marked_options || {}
								);
				marked.setOptions(markedOpts);

				var parser = new jscssp();
				var stylesheet = parser.parse(styles, false, true);
				var menus = [];
				var menuTitle = '';
				var currentMenu = {
					sheets: [],
					category: ''
				};
				var sheetPath;

				_.each(stylesheet.cssRules, function(rule) {
					// If /* Comment */
					if(rule.type === 101) {
						var comment = rule.parsedCssText;
						comment = comment.replace('/*', '');
						comment = comment.replace('*/', '');

						var comments = marked.lexer(comment);
						var defLinks = comments.links || {};
						_.each(comments, function (comment) {
							var tokens = [comment];
							tokens.links = defLinks;
							if(comment.type === 'heading' && comment.depth === 1) {
								menus.push(_.extend({}, currentMenu));
								currentMenu.sheets = [];
								currentMenu.category = comment.text;
							}
						});
					}
					// If @import url('');
					if(rule.type === 3) {
						// Removes @import url(''); leaving just the style sheet name.
						var sheet = rule.href.substr(rule.href.indexOf('(')+2, rule.href.indexOf(')')-rule.href.indexOf('(')-3);

						var regex = /(?:.*\/)(.*)\.(css|sass|scss|less)$/gi;
						var result = [];
						if((result = regex.exec(sheet)) !== null) {
							// result[0] Original Input.
							// result[1] Filename.
							// result[2] Extension.

							// Returns the path before 'extension/'.
							sheetPath = result[0].substr(0, result[0].lastIndexOf('' + result[2] + '/') + (result[2].length + 1));
							// Removes 'sheetPath' from 'sheet' leaving the path after 'extension/'.
							sheet = result[0].replace(sheetPath, '');
						}
						// Pushes style sheet to currentMenu.
						currentMenu.sheets.push(sheet);
					}
				});

				if(config.css_paths) {
					for(var i = 0; i < config.css_paths.length; i++) {
						var regex = /(?:.*\/)(.*)\.(css|sass|scss|less)$/gi;
						var result = [];
						if((result = regex.exec(config.css_paths[i])) !== null) {
							// result[0] Original Input.
							// result[1] Filename.
							// result[2] Extension.

							// Returns the path before 'extension/'.
							sheetPath = result[0].substr(0, result[0].lastIndexOf('' + result[2] + '/') + (result[2].length + 1));
							// Removes 'sheetPath' from 'sheet' leaving the path after 'extension/'.
							config.css_paths[i] = result[0].replace(sheetPath, '');
						}
						// Pushes style sheet to currentMenu.
						currentMenu.sheets.push(config.css_paths[i]);
					}
				}

				menus.push(currentMenu);

				$(that.el).html(_.template(dashboardPageTemplate, {_:_, menus: menus}));
				$('[href="' + window.location.hash + '"]').addClass('active');
				if(window.location.hash === '') {
					$('.js-phytoplankton-home').addClass('active');
				}

			});
		},
		events: {
			'click .phytoplankton-menu__list__item__link': function (ev) {
				if($(ev.currentTarget).hasClass('active')) {
					ev.preventDefault();
				} else {
					this.$el.find('.active').removeClass('active');
					$(ev.currentTarget).addClass('active');
					$(ev.currentTarget).parent().find('li:first-child').addClass('active');
				}
			},
			'click .phytoplankton-menu__list__item ul li ul li a': function(ev) {
				ev.preventDefault();
				var scrollAnchor = $(ev.currentTarget).attr('href');
				var scrollAnchor = scrollAnchor.substr(scrollAnchor.lastIndexOf('#') + 1);
				var scrollPoint = $('.phytoplankton-page__item *[id="' + scrollAnchor + '"]').offset().top - (50 + 40);
				$('html, body').animate({
					scrollTop: scrollPoint
				}, '200');
			}
		}
	});
	return DashboardPage;
});