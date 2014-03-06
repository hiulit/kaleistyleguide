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
		el: '.js-kalei-menu',
		render: function () {

			var that = this;

			that.$el.html('Loading styles');

			// If style sheet is defined in config.js
			if(config.css_paths) {
				config.css_path = config.css_paths[0];
			}

			var page = {blocks:[]};

			require(['text!' + config.css_path], function (styles) {
				// Default "imports.css"
				var masterStyle = config.css_path.substr(config.css_path.lastIndexOf('/')+1);

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
							// Returns <h1>
							if(comment.type === 'heading' && comment.depth === 1) {
								// menuTitle = marked.parser(tokens);
								menus.push(_.extend({}, currentMenu));
								currentMenu.sheets = [];
								currentMenu.category = marked.parser(tokens);
							} // Returns <h2>
							if(comment.type === 'heading' && comment.depth === 2) {
								// console.log('heading 2 -----> ', comment);
							}
							// Returns <h3>
							if(comment.type === 'heading' && comment.depth === 3) {
								// menus.push(_.extend({}, currentMenu));
								// currentMenu.sheets = [];
								// currentMenu.category = marked.parser(tokens);
							}
						});
					}
					// If @import url('');
					if(rule.type === 3) {
						// Removes @import url(''); leaving just the style sheet name.
						var sheet = rule.href.substr(rule.href.indexOf('(')+2, rule.href.indexOf(')')-rule.href.indexOf('(')-3);
						// console.log(config.css_path, rule, sheet);

						var regex = /(?:.*\/)(.*)\.(sass|scss)$/gi;
						var result = [];
						if((result = regex.exec(sheet)) !== null) {
							// result[0] Original Input.
							// result[1] Filename.
							// result[2] Extension.
							result[0] = result[0].substr(0, result[0].lastIndexOf('/scss'));
							console.log('RESULT', result[0]);
						}
						// Pushes style sheet to currentMenu.
						currentMenu.sheets.push(sheet);
					}
				});

				if(config.css_paths) {
					for(var i = 1; i < config.css_paths.length; i++) {
						currentMenu.sheets.push(config.css_paths[i])
					}
				}

				menus.push(currentMenu);

				$(that.el).html(_.template(dashboardPageTemplate, {_:_, menuTitle: menuTitle, menus: menus, entry: masterStyle}));
				$('[href="' + window.location.hash + '"]').addClass('active');
				if(window.location.hash === '') {
					$('.js-kalei-home').addClass('active');
				}

			});
		},
		events: {
			'click .kalei-menu__list__item__link': function (ev) {
				this.$el.find('a.active').removeClass('active');
				$(ev.currentTarget).addClass('active');

				var scroll = $(window).scrollTop();
				if(scroll !== 0) {
					$('body').animate({ // Scroll to top
						scrollTop: 0
					}, '200');
				}
			},
			'click .kalei-sheet-submenu li': function(ev) {
				$('body').removeClass('nav-open');

				$('html, body').animate({
					scrollTop: $(".kalei-page__item h1:contains('"+$(ev.currentTarget).text()+"')," +
									 ".kalei-page__item h2:contains('"+$(ev.currentTarget).text()+"')").offset().top - 60
				}, '200');
			}
		}
	});
	return DashboardPage;
});