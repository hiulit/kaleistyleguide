define([
	'jquery',
	'underscore',
	'backbone',
	'handlebars',
	'libs/marked/marked',
	'text!templates/style/page.html',
	'config',
	'jscssp',
	'libs/prism/prism',
	'libs/parseuri/parseuri',
	'libs/less/less-1.3.3.min',
	'hbs-objects/mockup-objects'
],
function($, _, Backbone, handlebars, marked, stylePageTemplate, config, jscssp, parseuri, mockupObjects){

	var that = null;

	// This is important for some preprocessors to operate efficiently and correctly.
	// They should cascade and compute aggregate styles for all imported rules internally,
	// and following this there will be no need to update the style block assigned to the page.
	firstRun = true;

	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-page',

		// HANDLEBARS
		// mockupObjects: {
		// 	'filtertabs':  {
		// 		name: "Epeli",
		// 		tabs: [
		// 			{
		// 				selected: true,
		// 				label: 'Hola soy label',
		// 				id: '1'
		// 			},
		// 			{
		// 				selected: false,
		// 				label: 'Hola soy label 2',
		// 				id: '2'
		// 			}
		// 		]
		// 	}
		// },

		// hbsTemplates: {},

		// initialize: function() {
		// 	$.get('templates/hbs/hello.hbs', false).success(function(src){
		// 		that.hbsTemplates['hello'] = Handlebars.compile(src);
		// 		hbsTemplateUncompiled = src;
		// 	});
		// },

		render: function () {

			that = this;

			var configDir;
			var configPath;
			var styleUrl;
			var styleExt;
			var styleDir = this.options.style;

			if(styleDir === null) {
				if(config.css_path) {
					styleUrl = config.css_path;
				} else if(config.css_path_url) {
					console.log('NOT supported yet');
				} else if(config.css_paths) {
					var regex = /(?:.*\/)(.*)\.(css|less|sass|scss)$/gi;
					var result = regex.exec(config.css_paths[0]);
						// result[0] Original Input.
						// result[1] Filename.
						// result[2] Extension.
					configPath = config.css_paths[0].replace(result[2] + '/', '');
					configDir = window.location.protocol + '//' +
								window.location.hostname +
								(window.location.port === '' ? '' : ':'+ window.location.port) +
								window.location.pathname;
					styleUrl = configDir + result[2] + '/' + configPath;
					window.location.href = configDir + '#/' + configPath;
				} else {
					alert('PUT SOMETHING IN THE CONFIG.JS!! C\'MON.....!');
				}
			} else {
				if(styleDir.substr(0,1) === '/') {
					// Non relative.
					configDir = configPath.substr(0, configPath.lastIndexOf('/'));
					var pUrl = parseuri(configDir);
					styleUrl = pUrl.protocol + '://' + pUrl.host + (pUrl.port === '' ? '' : ':'+ pUrl) + styleDir;
				} else {
					configPath = styleDir;
					configDir =	window.location.protocol + '//' +
								window.location.hostname +
								(window.location.port === '' ? '' : ':'+ window.location.port) +
								window.location.pathname;
					styleExt = configPath.substr(configPath.lastIndexOf('.')+1);
					styleUrl = configDir + styleExt + '/' + configPath;
				}
			}

			styleExt = styleUrl.substr(styleUrl.lastIndexOf('.')+1);

			require(['text!'+ styleUrl], function (stylesheet) {
				var parser = null;
				var regex = /(?:.*\/)(.*)\.(css|less|sass|scss)$/gi;
				var result = regex.exec(styleUrl);
					// result[0] Original Input.
					// result[1] Filename.
					// result[2] Extension.

				var page = {
					blocks:[]
				};

				switch (result[2]) {
					case 'css':
							parser = new jscssp();
							stylesheetCompiled = stylesheet;
							stylesheet = parser.parse(stylesheet, false, true);
							page = that.compute_css(stylesheet, stylesheetCompiled);
						break;
					case 'less':
							parser = new(less.Parser)({
								paths: [configDir + 'less/'], // Specify search paths for @import directives.
							});
							parser.parse(stylesheet, function (err, tree) {
								stylesheet = tree;
							});
							page = that.compute_less(stylesheet);
						break;
					case 'scss':
							// Thanks, so many thanks to Oriol Torras @uriusfurius.
							function findImports(str, basepath) {
								var url = configDir + styleExt + '/';
								var regex = /(?:(?![\/*]])[^\/* ]|^ *)@import ['"](.*?)['"](?![^*]*?\*\/)/g;
								var match, matches = [];
								while ((match = regex.exec(str)) !== null) {
									matches.push(match[1]);
								}
								_.each(matches, function(match) {
									// Check if it's a filename
									var path = match.split('/');
									var filename, fullpath, _basepath = basepath;
									if (path.length > 1) {
										filename = path.pop();
										var something, basepathParts;
										if (_basepath) {
											basepathParts = _basepath.split('/');
										}
										while ((something = path.shift()) === '..') {
											basepathParts.pop();
										}
										if (something) {
											path.unshift(something);
										}
										_basepath = (basepathParts ? basepathParts.join('/') + '/' : '') + path.join('/');
									} else {
										filename = path.join('');
									}
									filename = '_' + filename + '.' + styleExt;
									fullpath = _basepath + '/' + filename;

									var importContent = Module.read(url + fullpath);
									Sass.writeFile(match, importContent);

									findImports(importContent, _basepath);
								});
							}

							configPath = configPath.substr(0, configPath.lastIndexOf('/'));
							// Recursive function to find all @imports.
							findImports(stylesheet, configPath);
							// Writes style sheet so sass.js can compile it.
							Sass.writeFile(styleUrl, stylesheet);
							// Compiles Sass stylesheet into CSS.
							var stylesheetCompiled = Sass.compile(stylesheet);
							// Parses the CSS.
							parser = new jscssp();
							stylesheet = parser.parse(stylesheetCompiled, false, true);
							page = that.compute_css(stylesheet, stylesheetCompiled);
						break;
				}

				console.log((new Date()).getTime() + ' bottom', page);

				// Scroll to top
				var scroll = $(window).scrollTop();
				if(scroll !== 0) {
					$('html, body').scrollTop(0);
				}

				// Adds .active to the current hash (e.g. .readme.scss)
				if(window.location.hash !== '') {
					$('[href="' + window.location.hash + '"]').addClass('active');
				}

				$('.phytoplankton-menu__list__item ul li ul li').remove();
				var submenu = $('<ul>');

				////////////NEEDS TO BE EXPORTED TO Menu.js
				// Creates the menu.
				_.each(page.blocks, function (block) {
					var ul = $('<ul>');
					_.each(block.heading, function(val, i) {
						if(i >= 1) {
							var li = $('<li>');
							li.append($('<a href="#' + block.headingID[i] + '">').text(val));
							ul.append(li);
						} else {
							var li = $('<li>');
							li.append($('<a href="#' + block.headingID[i] + '">').text(val));
							submenu.append(li);
						}
					});
					submenu.find('li:last').append(ul);
				});

				////////////NEEDS TO BE EXPORTED TO Menu.js
				$('.phytoplankton-menu > ul > li > ul > li > ul').remove();
				$('[data-sheet="' + that.options.style + '"]').append(submenu);
				$('.phytoplankton-menu > ul > li > ul > li > ul > li:first-child').addClass('active');

				$(that.el).html(_.template(stylePageTemplate, {_:_, page: page, config: config, externalStyles: config.external_stylesheets}));

				// Prism's colour coding in <code> blocks.
				Prism.highlightAll();
				// Prism's File Highlight plugin function.
				fileHighlight();
				// Call for Fixie.
				fixie.init();

				firstRun = false;

				// Rename Page Heading's ID
				headingArrayPage = [];
				var i = 2;
				$('.phytoplankton-page__item').find('*').filter(':header').each(function() {
					var hola = $(this).attr('id');
					if(hola) {
						if(headingArrayPage.lastIndexOf(hola) !== -1) {
							hola = $(this).attr('id', hola + i);
							headingArrayPage.push(hola);
							i++;
						} else {
							headingArrayPage.push(hola);
						}
					}
				});

				// Rename Menu Heading's ID
				headingArrayMenu = [];
				var k = 2;
				$('.phytoplankton-menu > ul > li > ul > li > ul > li a').each(function() {
					var adeu = $(this).attr('href');
					if(adeu) {
						if(headingArrayMenu.lastIndexOf(adeu) !== -1) {
							adeu = $(this).attr('href', adeu + k);
							headingArrayMenu.push(adeu);
							k++;
						} else {
							headingArrayMenu.push(adeu);
						}
					}
					console.log(adeu);
				});

				$('.tabs li').click(function() {
					var tabID = $(this).attr('data-tab');
					if(tabID === 'tab-1') {
						$(this).next().removeClass('is-active');
						$('.tabs + pre + pre').hide();
						$(this).addClass('is-active');
						$('.tabs + pre').show();
					} else if (tabID === 'tab-2') {
						$(this).prev().removeClass('is-active');
						$('.tabs + pre').hide();
						$(this).addClass('is-active');
						$('.tabs + pre + pre').show();
					}
				});

				$(window).scroll(function () {
					var k = 0;
					$('.phytoplankton-page__item').find(':header').each(function(i) {
						if(!$(this).offsetParent().hasClass('code-render')) {
							if(that.is_on_screen($(this), (80 + 20))) {
								hash = window.location.hash;
								hash = hash.substr(hash.lastIndexOf('#') + 2);
								$('.phytoplankton-menu__list__item li').removeClass('active');
								$('.phytoplankton-menu__list__item[data-sheet="' + hash + '"]').find('li').eq(k).addClass('active');
								k++;
							}
						}
					});
				});

				// If the last element of the page is higher than window.height(),
				// some additional padding-bottom is added so it stops at the top of the page.
				// If the last element is lower, it doesn't add any padding-bottom.
				// But we can think of something smarter.
				function paddingBottom() {
					if($('.phytoplankton-page__item').length !== 0) {
						var pageHeight = $(window).height() - 70;
						var lastElHeight = $('.phytoplankton-page__item:last').outerHeight();
						var lastElPaddingTop = $('.phytoplankton-page__item:last').css('padding-top');
						var lastElPaddingBottom = $('.phytoplankton-page__item:last').css('padding-bottom');
						lastElPaddingTop = parseInt(lastElPaddingTop.substr(0, lastElPaddingTop.length - 2)); // Removes 'px' from string and converts string to number.
						lastElPaddingBottom = parseInt(lastElPaddingBottom.substr(0, lastElPaddingBottom.length - 2)); // Removes 'px' from string and converts string to number.
						lastElPaddingTotal = lastElPaddingTop+lastElPaddingBottom;
						if(lastElHeight >= pageHeight) {
							$(that.el).css({ 'padding-bottom' : 0 });
						} else {
							$(that.el).css({ 'padding-bottom' : (pageHeight-lastElHeight) });
						}
					}
				}
				// Please help me xD
				setTimeout(paddingBottom, 2000);

			});
		},

		is_on_screen: function(el, offset) {

			var win = $(window);

			var viewport = {
				top : win.scrollTop()
			};

			viewport.bottom = viewport.top + win.height();

			var bounds = el.offset();

			return (!(viewport.top + offset < bounds.top || viewport.top > bounds.bottom));

		},

		compute_css: function(stylesheet, stylesheetCompiled) {
			var page = {
				blocks: [],
				css: '',
				stylesheets: []
			};

			_.each(stylesheet.cssRules, function(rule) {
				switch (rule.type) {
					// Standard rule?
					case 1:
						break;
					// Import Rule (@import)
					case 3:
						// If it's the 'imports.css'
						if(window.location.hash === '') {
							// Get the first link from the menu
							result = $('.phytoplankton-menu__list__item__link').attr('href');
							window.location.href =	window.location.protocol +
													'//' + window.location.hostname +
													(window.location.port === '' ? '' : ':'+ window.location.port) +
													window.location.pathname + result;
						}
						// Remove all the @import
						stylesheet.deleteRule(rule);
						break;
					// Comment Block.
					case 101:
						if(window.location.hash !== '') {
							page.blocks = page.blocks.concat(that.parse_commentblock(rule.parsedCssText))
						}
						break;
				}
			});

			page.css = stylesheetCompiled;

			var parser = new(less.Parser);
			var stylesheet;
			page.css = '.code-render { ' + page.css + ' }';
			parser.parse(page.css, function (err, tree) {
				stylesheet = tree;
			});

			page.css = stylesheet.toCSS({ compress: true });
			return page;
		},

		compute_less: function(stylesheet) {
			var page = {
				blocks: [],
				css: '',
				stylesheets: []
			};

			_.each(stylesheet.rules, function(rule) {
				// Comment block.
				if (rule.silent === false) {
					page.blocks = page.blocks.concat(that.parse_commentblock(rule.value));
				// Standard Rule.
				} else if (rule.rules !== null) {
				// Import Rule
				} else if (rule.path !== null) {
				}
			});

			page.css = stylesheet.toCSS({ compress: true });

			var parser = new(less.Parser);
			var stylesheet;
			page.css = '.code-render { ' + page.css + ' }';
			parser.parse(page.css, function (err, tree) {
				stylesheet = tree;
			});

			page.css = stylesheet.toCSS({ compress: true });
			return page;
		},

		parse_hbs: function(text, block) {
			var properties = JSON.parse(text);
			var obj = that.mockupObjects[properties.dataObject];
			var template = that.hbsTemplates[properties.template];
			return template(obj);
		},

		parse_commentblock: function (comment_block_text) {
			// Removes /* & */.
			comment_block_text = comment_block_text.replace(/(?:\/\*)|(?:\*\/)/gi, '');

			marked.setOptions(_.extend({
					sanitize: false,
					gfm: true
				},
				config.marked_options || {}
			));

			var lexedCommentblock = marked.lexer(comment_block_text);
			// Lexer appends definition links to returned token object.
			var lexerLinks = lexedCommentblock.links || {};

			var return_val = [];
			var block = {
				content: [],
				heading: [],
				headingID: []
			};

			_.each(lexedCommentblock, function (comment) {
				switch (comment.type) {
					case 'code':
						// If there's no language:
						// Push the code without example nor language header.
						if (!comment.lang) {
							block.content.push(comment);
						// If it's "markup" (html):
						// Push the code for an example with language header.
						} else if(comment.lang === 'markup') {
							block.content.push({
								type: 'html',
								text: '<div class="code-lang">Example</div>' +
										'<div class="code-render clearfix">' + comment.text + '</div>'
							});
							block.content.push(comment);
						} else if(comment.lang === 'hbs') {
							comment.hbsTemplateUncompiled = hbsTemplateUncompiled;
							comment.text = that.parse_hbs(comment.text);
							block.content.push({
								type: 'html',
								lang: 'markup',
								text: '<div class="code-lang">Example</div>' +
										'<div class="code-render code-render--hbs clearfix">' + comment.text + '</div>' +
										'<ul class="tabs">' +
										'<li class="tabs__item is-active" data-tab="tab-1">Handlebars</li>' +
										'<li class="tabs__item" data-tab="tab-2">HTML</li>' +
										'</ul>'
							});
							block.content.push({
								type: 'code',
								lang: 'hbs',
								text: comment.hbsTemplateUncompiled
							});
							block.content.push(comment);
						// If the code is not "markup" (html):
						// Push the code without example but with language header.
						} else {
							block.content.push({
								type: 'html',
								text: '<div class="code-lang">' + comment.lang + '</div>'
							});
							block.content.push(comment);
						}
						break;
					case 'heading':
						block.heading.push(comment.text);
						block.headingID.push(comment.text.toLowerCase().replace(/\W+/g, '-'));
						block.content.push(comment);
						break;
					default:
						// Push everything else.
						block.content.push(comment);
						break;
				}
			});

			// Parse the content blocks and return the HTML to display.
			block.content.links = lexerLinks;
			block.content = marked.parser(block.content);

			return_val.push(block);
			return return_val;
		},

	});
	return StylePage;
});
