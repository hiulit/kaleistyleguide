define([
	'jquery',
	'underscore',
	'backbone',
	'handlebars',
	'marked',
	'text!templates/style/page.html',
	'config',
	'hbs_context',
	'hbs_helpers',
	'gonzales',
	'libs/prism/prism',
	'libs/stacktable/stacktable'
],
function($, _, Backbone, Handlebars, marked, stylePageTemplate, config, mockupObjects) {

	var that = null;

	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-page',

		render: function () {

			// require(['views/style/tabs'], function() {

			// });

			that = this;

			var configDir;
			var configPath;
			var styleUrl;
			var styleExt;
			var styleDir = window.location.hash;
			styleDir = styleDir.substr(styleDir.lastIndexOf('#') + 2);

			configDir =	window.location.protocol + '//' +
							window.location.hostname +
							(window.location.port === '' ? '' : ':'+ window.location.port) +
							window.location.pathname;

			configPath = config.menu[0].url[0];

			if(styleDir === '') {
				styleExt = configPath.substr(configPath.lastIndexOf('.') +1);
				styleUrl = configDir + styleExt + '/' + configPath;
				window.location.href =	configDir + '#/' + configPath;
			} else {
				styleExt = styleDir.substr(styleDir.lastIndexOf('.')+1);
				styleUrl = configDir + styleExt + '/' + styleDir;
				configPath = styleDir;
			}

			require(['text!'+ styleUrl], function (stylesheet) {
				var parser = null;
				var regex = /(?:.*\/)(.*)\.(css|less|sass|scss)$/gi;
				var result = regex.exec(styleUrl);
					// result[0] Original Input.
					// result[1] Filename.
					// result[2] Extension.

				if(result === null) {
					return alert('You\'re missing the extension (.css, .sass, .scss, .less) in the URL.');
				}

				var page = {
					blocks: []
				};

				var cssUncompiled = stylesheet;

				switch (result[2]) {
					case 'css':
							var cssCompiled = that.remove_comments(cssUncompiled);
							page = that.compute_css(stylesheet, cssUncompiled, cssCompiled, styleExt);
							that.render_page(page);
						break;
					case 'less':
							require(['libs/less/less'], function(less) {
								if (less.render) { // Less v2.0.0 and above (not working actually).
									less.render(stylesheet, function (e, result) {
										var s = stylesheet;
										if (!e) {
											var cssCompiled = that.remove_comments(result.css);
											page = that.compute_css(result.css, cssUncompiled, cssCompiled, styleExt);
											that.render_page(page);
										}
										else {
											showError(e);
										}
									});
								}
							});
						break;
					case 'sass':
					case 'scss':
						if('querySelector' in document &&
							document.documentMode >= 10 || // Checks if it's IE10+.
							document.documentMode === undefined && // Checks if it's not IE.
							'localStorage' in window &&
							'addEventListener' in window) {
							// Loads sass.js
							require(['libs/sassjs/dist/sass.min'], function(Sass) {
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
								Sass.options({
									style: Sass.style.expanded
								});
								// Compiles Sass stylesheet into CSS.
								var cssCompiled = Sass.compile(stylesheet, function(result) {
									console.log(result);
								});
								var cssUncompiled = that.remove_comments(stylesheet);
								// Parses the CSS.
								page = that.compute_css(cssCompiled, cssUncompiled, cssCompiled, styleExt);
								that.render_page(page);
							});
						} else {
							alert('Your browser doesn\'t support Sass.js.\nUpdate it to a newer version or use a modern browser ;)');
						}
					break;
				}
			});
		},

		render_page: function(page) {

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

			var submenu = $('<ul data-gumshoe>');
			var externalScripts = [];
			////////////NEEDS TO BE EXPORTED TO Menu.js
			// Creates the menu.
			_.each(page.blocks, function (block) {
				if(block.scriptsArray.length > 0) {
					externalScripts.push(block.scriptsArray[0]);
				}
				var ul = $('<ul>');
				_.each(block.heading, function(val, i) {
					var li = $('<li>');
					if(i >= 1) {
						li.append($('<a href="#' + block.headingID[i] + '" data-scroll>').html(val));
						ul.append(li);
					} else {
						// var li = $('<li>');
						li.append($('<a href="#' + block.headingID[i] + '" data-scroll>').html(val));
						submenu.append(li);
					}
				});
				submenu.find('li:last').append(ul);
			});

			var styleDir = window.location.hash;
			styleDir = styleDir.substr(styleDir.lastIndexOf('#') + 2);

			$('.phytoplankton-menu > ul > li > ul > li > ul').remove();
			$('[data-sheet="' + styleDir + '"]').append(submenu);
			// $('.phytoplankton-menu > ul > li > ul > li > ul > li:first-child').addClass('active');
			////////////NEEDS TO BE EXPORTED TO Menu.js

			this.$el.html(_.template(stylePageTemplate)({page: page, config: config, externalStyles: config.external_stylesheets}));

			_.each(externalScripts, function (val, i) {
				$('head').append(externalScripts[i]);
			});

			// Removes all <p> that contains @javascript
			$('p:contains("@javascript")').remove();
			// Adds class so Prism's Line Number plugin can work.
			$('pre').addClass('line-numbers');
			// Prism's colour coding in <code> blocks.
			Prism.highlightAll();
			// Prism's File Highlight plugin function.
			fileHighlight();
			// Call for Fixie.
			fixie.init();
			// Call for Stacktable.
			$('table').stacktable();

			require(['libs/gumshoe/dist/js/gumshoe'], function(gumshoe) {
				gumshoe.init({
					offset: 40
				});
			});

			require(['libs/smooth-scroll/dist/js/smooth-scroll'], function(smoothScroll) {
				smoothScroll.init({
					offset: 40
				});
			});

			require(['libs/zeroclipboard/dist/ZeroClipboard'], function(ZeroClipboard) {

				$('pre[class*="language-"] code').each(function() {

					var copy = $( "<div/>", {
						"class": "copy-to-clipboard",
						// "href" : "#",
						"text": "Copy to Clipboard",
						// "title": "Copy to Clipboard"
					}),
					code = $(this).text(),
					clip = new ZeroClipboard( copy, {
						text: code
					});

					clip.on( 'ready', function(event) {
						// console.log( 'movie is loaded' );

						clip.on( 'copy', function(event) {
							event.clipboardData.setData('text/plain', code);
						} );

						clip.on( 'aftercopy', function(event) {
							console.log('Copied text to clipboard:\n\n' + event.data['text/plain']);
						} );
					} );

					clip.on( 'error', function(event) {
						// console.log( 'ZeroClipboard error of type "' + event.name + '": ' + event.message );
						ZeroClipboard.destroy();
					} );
					$(this).parent().append(copy);
				});


			});

			function renameHeadingID(tag, that, array, index) {
				var nameID = that.attr(tag);
				if(array.lastIndexOf(nameID) !== -1) {
					nameID = that.attr(tag, nameID + index);
					array.push(nameID);
				} else {
					array.push(nameID);
				}
			}

			// Renames Page Heading's ID.
			headingArray = [];
			$('.phytoplankton-page__item').find('*').filter(':header').each(function(i) {
				var that = $(this);
				renameHeadingID('id', that, headingArray, i);
			});

			// Renames Menu Heading's ID.
			headingArrayMenu = [];
			$('.phytoplankton-menu > ul > li > ul > li > ul > li a').each(function(i) {
				var that = $(this);
				renameHeadingID('href', that, headingArrayMenu, i);
			});

			// Creates tabs.
			$('.phytoplankton-tabs > li').each(function(i) {
				$(this).attr('data-tab', 'tab-' + (i+1));
			});

			$('.phytoplankton-tabs ~ pre').each(function(i) {
				$(this).attr('id', 'tab-' + (i+1));
			});

			$('.phytoplankton-tabs + pre').addClass('is-active');

			$('.phytoplankton-tabs__item').click(function() {
				var tab_id = $(this).attr('data-tab');

				$('.phytoplankton-tabs li').removeClass('is-active');
				$('.phytoplankton-tabs ~ pre').removeClass('is-active');

				$(this).addClass('is-active');
				$("#"+tab_id).addClass('is-active');
			});

			// Adds page headers's title and URL.
			var menuUrl = $('.phytoplankton-menu__list__item__subheader.active').attr('href');
			menuUrl = menuUrl.substr(menuUrl.lastIndexOf('#') + 1);
			var menuTitle = $('.phytoplankton-menu__list__item__subheader.active').parent().parent().parent().find('.phytoplankton-menu__list__item__header').text().trim();
			$('.phytoplankton-page__header-title').html(menuTitle);
			$('.phytoplankton-page__header-url').html(menuUrl);

			// Sets page's padding-top to be the same as pageheading's height.
			var pageHeadingHeight = $('.phytoplankton-page__header').outerHeight();
			$('.phytoplankton-page').css('padding-top', pageHeadingHeight + 24);

			// $(window).scroll(function () {
			// 	var k = 0;
			// 	$('.phytoplankton-page__item').find(':header').each(function(i) {
			// 		if(!$(this).offsetParent().hasClass('code-render')) {
			// 			if(that.is_on_screen($(this), (pageHeadingHeight + 48))) {
			// 				var hash = window.location.hash;
			// 				hash = hash.substr(hash.lastIndexOf('#') + 2);
			// 				$('.phytoplankton-menu__list__item li').removeClass('active');
			// 				$('.phytoplankton-menu__list__item[data-sheet="' + hash + '"]').find('li').eq(k).addClass('active');
			// 				k++;
			// 			}
			// 		}
			// 	});
			// });

			// If the last element of the page is higher than window.height(),
			// some additional padding-bottom is added so it stops at the top of the page.
			// If the last element is lower, it doesn't add any padding-bottom.
			// But we can think of something smarter.
			function paddingBottom() {
				if($('.phytoplankton-page__item').length !== 0) {
					var pageHeight = $(window).height() - pageHeadingHeight;
					var lastElHeight = $('.phytoplankton-page__item:last').outerHeight();
					var lastElPaddingTop = $('.phytoplankton-page__item:last').css('padding-top');
					var lastElPaddingBottom = $('.phytoplankton-page__item:last').css('padding-bottom');
					lastElPaddingTop = parseInt(lastElPaddingTop.substr(0, lastElPaddingTop.length - 2), 10); // Removes 'px' from string and converts string to number.
					lastElPaddingBottom = parseInt(lastElPaddingBottom.substr(0, lastElPaddingBottom.length - 2), 10); // Removes 'px' from string and converts string to number.
					lastElPaddingTotal = lastElPaddingTop + lastElPaddingBottom;
					if(lastElHeight >= pageHeight) {
						// $(that.el).css({ 'padding-bottom' : 0 });
					} else {
						$(that.el).css({ 'padding-bottom' : (pageHeight - lastElHeight - lastElPaddingTop) });
					}
				}
			}
			// Please help me xD
			setTimeout(paddingBottom, 2000);

			$(window).resize(function() {
				paddingBottom();
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

		compute_css: function(stylesheet, cssUncompiled, cssCompiled, styleExt) {
			var page = {
				blocks: [],
				css: ''
			};

			var cssArray = [];

			var parsedStylesheet = gonzales.srcToCSSP(stylesheet);

			_.each(parsedStylesheet, function(rule) {
				if(rule[0] === 'ruleset') {
					rule = gonzales.csspToSrc(rule);
					cssArray.push('.code-render ' + rule);
				} else if (rule[0] === 'comment') {
					if(window.location.hash !== '') {
						rule = gonzales.csspToSrc(rule);
						page.blocks = page.blocks.concat(that.parse_commentblock(rule, cssUncompiled, cssCompiled, styleExt));
					}
				}
			});

			page.css = cssArray.join('');

			return page;
		},

		remove_comments: function(stylesheet) {
			// Remove (and trim) CSS comments.
			stylesheet = stylesheet.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*?\*\/)/g, ''); // Remove comments.
			stylesheet = stylesheet.replace(/((^\s+|\s+$))/g,''); // Trim leading and trailing.
			stylesheet = stylesheet.replace(/(\n\s*\n)/g, '\n\n'); // Remove extra line breaks.
			return stylesheet;
		},

		parse_hbs: function(text) {
			var properties = JSON.parse(text);
			var obj = mockupObjects[properties.context];
			var source;
			var template;
			$.ajax({
				url: config.hbs_template_path + properties.template +'.hbs',
				async: false,
				cache: true,
				success: function(data) {
					source = String(data); // Uses String() for Firefox to work properly.
					template = Handlebars.compile(source);
				}
			});
			return [
				template(obj),
				source
			];
		},

		parse_commentblock: function (parsedCommentBlock, cssUncompiled, cssCompiled, styleExt) {
			// Removes /* & */.
			parsedCommentBlock = parsedCommentBlock.replace(/(?:\/\*)|(?:\*\/)/gi, '');

			marked.setOptions(config.marked_options);

			var lexedCommentblock = marked.lexer(parsedCommentBlock);
			// Lexer appends definition links to returned token object.
			var lexerLinks = lexedCommentblock.links || {};

			var return_val = [];
			var block = {
				content: [],
				heading: [],
				headingID: [],
				scriptsArray: []
			};

			_.each(lexedCommentblock, function (comment) {
				switch (comment.type) {
					case 'paragraph':
						// Finds all the scripts to be loaded.
						var str = comment.text;
						var regex = /@javascript [\{](.*?)[\}]/g;
						var match;
						while ((match = regex.exec(str)) !== null) {
							match[1] = match[1].trim();
							match[1] = match[1].replace(/\"/g, '');
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = config.external_scripts_path + match[1] +'';
							block.scriptsArray.push(script);
						}
						block.content.push(comment);
						break;
					case 'code':
						// If there's no language:
						// Push the code without example nor language header.
						if (!comment.lang) {
							block.content.push(comment);
						// If it's "markup" (html):
						// Push the code for an example with language header.
						} else if(comment.lang === 'markup') {
							cssUncompiled = that.remove_comments(cssUncompiled);
							cssCompiled = that.remove_comments(cssCompiled);
							if(cssUncompiled) { // If has styles (CSS)
								// Pushes the example
								block.content.push({
									type: 'html',
									text: '<div class="code-render clearfix">' + comment.text + '</div>'
								});
								if(styleExt !== 'css') {
									// Pushes the tabs
									block.content.push({
										type: 	'html',
										text: 	'<ul class="phytoplankton-tabs">' +
													'<li class="phytoplankton-tabs__item is-active">HTML</li>' +
													'<li class="phytoplankton-tabs__item">' + styleExt + '</li>' +
													'<li class="phytoplankton-tabs__item">CSS</li>' +
												'</ul>'
									});
								} else {
									// Pushes the tabs
									block.content.push({
										type: 	'html',
										text: 	'<ul class="phytoplankton-tabs">' +
													'<li class="phytoplankton-tabs__item is-active">HTML</li>' +
													'<li class="phytoplankton-tabs__item">' + styleExt + '</li>' +
												'</ul>'
									});
								}

								block.content.push(comment);

								if(styleExt !== 'css') {
									//Pushes the uncompiled styles
									block.content.push({
										type: 'code',
										lang: styleExt,
										text: cssUncompiled
									});
								}
								//Pushes the compiled styles
								block.content.push({
									type: 'code',
									lang: 'css',
									text: cssCompiled
								});
							} else {
								block.content.push({
									type: 	'html',
									text: 	'<div class="code-render clearfix">' + comment.text + '</div>'
								});
								block.content.push(comment);
							}
						// If it's "handlebars":
						} else if(comment.lang === 'handlebars') {
							cssCompiled = that.remove_comments(cssCompiled);
							var parsedHbs = that.parse_hbs(comment.text);
							comment.text = parsedHbs[0];
							comment.hbsTemplateUncompiled = parsedHbs[1];
							if(cssCompiled !== '') { // If it has styles
								block.content.push({
									type: 'html',
									lang: 'markup',
									text: '<div class="code-render clearfix">' + comment.text + '</div>' +
											'<ul class="phytoplankton-tabs">' +
											'<li class="phytoplankton-tabs__item is-active" data-tab="tab-1">Handlebars</li>' +
											'<li class="phytoplankton-tabs__item" data-tab="tab-2">HTML</li>' +
											'<li class="phytoplankton-tabs__item" data-tab="tab-3">CSS</li>' +
											'</ul>'
								});
							} else {
								block.content.push({
									type: 'html',
									lang: 'markup',
									text: '<div class="code-render clearfix">' + comment.text + '</div>' +
											'<ul class="phytoplankton-tabs">' +
											'<li class="phytoplankton-tabs__item is-active" data-tab="tab-1">Handlebars</li>' +
											'<li class="phytoplankton-tabs__item" data-tab="tab-2">HTML</li>' +
											'</ul>'
								});
							}
							block.content.push({
								type: 'code',
								lang: 'handlebars',
								text: comment.hbsTemplateUncompiled
							});

							block.content.push(comment);

							if(cssCompiled !== '') { // If it has styles
								//Pushes the compiled styles
								block.content.push({
									type: 'code',
									lang: 'css',
									text: cssCompiled
								});
							}
						// If the code is not "markup" (html):
						// Push the code without example but with language header.
						} else {
							block.content.push(comment);
						}
						break;
					case 'heading':
						// Fixes the sourceMappingURL from Sass files
						if(comment.text.indexOf("sourceMappingURL=") === -1) {
							block.heading.push(comment.text);
							block.headingID.push(comment.text.toLowerCase().replace(/\W+/g, '-'));
							block.content.push(comment);
						}
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
