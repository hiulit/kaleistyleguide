define([
	'jquery',
	'underscore',
	'backbone',
	'libs/marked/marked',
	'text!templates/style/page.html',
	'config',
	'jscssp',
	'pagedown',
	'libs/prism/prism',
	'libs/parseuri/parseuri',
	'libs/less/less-1.3.3.min'
],
function($, _, Backbone, marked, stylePageTemplate, config, jscssp, Pagedown, hljs, parseuri){
	var that = null;
	var StylePage = Backbone.View.extend({
		el: '.kalei-page',
		render: function () {

			that = this;

			var configDir;
			var styleUrl;
			var styleExt;
			var styleDir = this.options.style;

			if(styleDir === null) {
				styleDir = config.css_path.substr(config.css_path.lastIndexOf('/')+1);
			}

			if(styleDir.substr(0,1) === '/') {
				// Non relative.
				configDir = config.css_path.substr(0, config.css_path.lastIndexOf('/'));
				var pUrl = parseuri(configDir);
				styleUrl = pUrl.protocol + '://' + pUrl.host + (pUrl.port === '' ? '' : ':'+ pUrl) + styleDir;
			} else {
				// Returns style sheet extension e.g. 'css'.
				styleExt = styleDir.substr(styleDir.lastIndexOf('.')+1);
				// Returns e.g. 'http://localhost/path/path' (no filename nor extension).
				configDir = config.css_path.substr(0, config.css_path.lastIndexOf('/'));
				// Returns e.g. 'http://localhost/path/' (root directory).
				configDir = configDir.substr(0, configDir.lastIndexOf('/'));
				// Returns e.g 'http://localhost/css/path/to/stylesheet.css'.
				styleUrl = configDir + '/' + styleExt + '/' + styleDir;
			}

			// Returns file extension from URL.
			var styleExt = styleUrl.replace(/^.*\./,'');
			var stylePath = styleDir.substr(0, styleDir.lastIndexOf('/'));

			// If config.css_path stylesheet (default === 'imports.css') is already loaded, don't load it again.
			if(!$('link[href="' + config.css_path + '"]').length) {
				$('head').append('<link rel="stylesheet" href="' + config.css_path + '"" type="text/' + styleExt +'" />');
			}
			// If any other stylesheet is already loaded, don't load it again.
			if(!$('link[href="' + styleUrl + '"]').length) {
				$('head').append('<link rel="stylesheet" href="' + styleUrl + '"" type="text/' + styleExt +'" />');
			}

			// var navToggle = $('.nav');

			// navToggle.click(function(){
			// 	$('body').removeClass('loading').toggleClass('nav-open');
			// });

			// $('.kalei-page').click(function(){
			// 	$('body').removeClass('nav-open');
			// });

			$('.kalei-menu__list__item__link').removeClass('active');

			if(window.location.hash !== '') {
				$('[href="' + window.location.hash + '"]').addClass('active');
			}

			require(['text!'+ styleUrl], function (stylesheet) {
				var parser = null;
				var regex = /(?:.*\/)(.*)\.(css|less|sass|scss)$/gi;
				var result = regex.exec(styleUrl);
					// result[0] Original Input.
					// result[1] Filename.
					// result[2] Extension.

				var page = {blocks:[]};

				switch (result[2]) {
					case 'css':
							parser = new jscssp();
							stylesheet = parser.parse(stylesheet, false, true);
							page = that.compute_css(stylesheet);
						break;
					case 'less':
							parser = new(less.Parser)({
								paths: [configDir + '/'], // Specify search paths for @import directives.
							});
							parser.parse(stylesheet, function (err, tree) {
								stylesheet = tree;
							});
							page = that.compute_less(stylesheet);
						break;
					case 'scss':
							// Thanks, so many thanks to Oriol Torras @uriusfurius.
							function findImports(str, basepath) {
								var url = configDir + '/' + styleExt + '/';
								var regex = /(?:(?![\/*]])[^\/* ]|^ *)@import ['"](.*?)['"](?![^*]*?\*\/)/g;
								var match, matches = [];
								while ((match = regex.exec(str)) !== null) {
									matches.push(match[1]);
								}
								console.log('Import Matches ---->', matches);

								_.each(matches, function(match) {
									// Check if is a filename
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
									console.log('filename:', filename);
									console.log('basepath:', _basepath);
									console.log('fullpath:', fullpath);

									var importContent = Module.read(url + fullpath);
									Sass.writeFile(match, importContent);

									findImports(importContent, _basepath);
								});
							}

							findImports(stylesheet, stylePath);

							Sass.writeFile(styleUrl, stylesheet);

							// Compiles SCSS stylesheet into CSS.
							var stylesheetCompiled = Sass.compile(stylesheet);
							// Embeds CSS styles in <head>.
							var style = document.createElement('style');
							style.textContent = stylesheetCompiled;
							document.head.appendChild(style);
							// Parses the CSS.
							parser = new jscssp();
							stylesheet = parser.parse(stylesheetCompiled, false, true);
							page = that.compute_css(stylesheet);

						break;
				}

				console.log((new Date()).getTime() + " bottom", page)

				$('.kalei-sheet-submenu').hide();
				var submenu = $('<ul>');

				////////////NEEDS TO BE EXPORTED TO Menu.js
				_.each(page.blocks, function (block) {
					if (block.heading != "") {
						var li = $('<li>');
						li.append($('<h3>').text(block.heading));
						submenu.append(li);
					}
				});

				$('li:first-child', submenu).addClass('active');
				$('.kalei-sheet-submenu', $('[data-sheet="' + that.options.style + '"]')).html(submenu).slideDown(200);
				////////////NEEDS TO BE EXPORTED TO Menu.js

				$(that.el).html(_.template(stylePageTemplate, {_:_, page: page, config: config}));

				// Prism's colour coding in <code> blocks.
				Prism.highlightAll();
				// Prism's File Highlight plugin function.
				fileHighlight();

				$(window).scroll(function () {
					var scroll = $(window).scrollTop();
					if(scroll === 0) {
						$('.kalei-nav').removeClass('is-disabled');
					} else {
						$('.kalei-nav').addClass('is-disabled');
					}
					$(".kalei-page__item").each(function(){
						if ( that.is_on_screen($(this), 60) ) {
							$(".kalei-sheet-submenu li").removeClass('active');
							$(".kalei-sheet-submenu li:contains('" + $(this).find('> h1').text() +"')," +
								 ".kalei-sheet-submenu li:contains('" + $(this).find('> h2').text() +"')").addClass('active');
						}
					});
				});

				// Call for fixie.
				fixie.init();

				// Add more space at the bottom of the page to avoid scrolling to last node from menu.
				// But we can think for something more smarter.

				// Now it works like a charm!
				// If the last element of the page is higher than window.height(),
				// some additional padding-bottom is added so it stops at the top of the page.
				// If the last element is lower, it doesn't add any padding-bottom.

				// Returns height of browser viewport.
				var pageHeight = $(window).height();
				// Returns height of last item (.outerHeight() returns height + padding).
				var lastElHeight = $('.kalei-page__item:last').outerHeight();
				// Returns padding-top of last item.
				var lastElPaddingTop = $('.kalei-page__item:last').css( 'padding-top');
				// Returns padding-bottom of last item.
				var lastElPaddingBottom = $('.kalei-page__item:last').css( 'padding-bottom');
				// Removes px from string and converts string to number.
				lastElPaddingTop = parseInt(lastElPaddingTop.substr(0, lastElPaddingTop.length - 2));
				// Removes px from string and converts string to number.
				lastElPaddingBottom = parseInt(lastElPaddingBottom.substr(0, lastElPaddingBottom.length - 2));
				// Returns the sum of paddings (top and bottom).
				lastElPaddingTotal = lastElPaddingTop+lastElPaddingBottom;

				if(lastElHeight >= pageHeight ) {
					$(that.el).css({ 'padding-bottom' : 0 });
				} else {
					$(that.el).css({ 'padding-bottom' : ((pageHeight-lastElHeight)-lastElPaddingTotal) });
				}

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

		compute_css: function(stylesheet) {
			console.log("compute_css()")
			var page = {
				blocks:[],
				css:"",
				stylesheets: []
			};

			_.each(stylesheet.cssRules, function(rule) {
				switch (rule.type) {
					// Standard rule?
					case 1:
						break;
					// Import Rule (@import)
					case 3:
						// We need to import jsscp doesn't compile imports.
						if(window.location.hash === '') {
							result = $('.kalei-menu__list__item__link').attr('href');
							window.location.href =	window.location.protocol +
														'//' + window.location.hostname +
														(window.location.port === '' ? '' : ':'+ window.location.port) +
														window.location.pathname + result;
						}
						// stylesheet.deleteRule(rule);
						break;
					// Comment Block.
					case 101:
						if(window.location.hash !== '') {
							page.blocks = page.blocks.concat(that.parse_commentblock(rule.parsedCssText))
						}
						break;
				}
			});

			page.css = stylesheet.cssText()

			var parser = new(less.Parser);
			var stylesheet;
			page.css = ".kalei-page{" + page.css + "}";
			parser.parse(page.css, function (err, tree) {
				stylesheet = tree;
			});

			page.css = stylesheet.toCSS({ compress: true });
			return page;
		},

		compute_less: function(stylesheet) {
			console.log("compute_less()")
			var page = {
				blocks:[],
				css:"",
				stylesheets: []
			};

			console.log(stylesheet)

			_.each(stylesheet.rules, function(rule) {
				// Comment block.
				if (rule.silent !== null) {
					page.blocks = page.blocks.concat(that.parse_commentblock(rule.value))
				// Standard Rule.
				} else if (rule.rules !== null) {

				//Import Rule
				} else if (rule.path !== null) {
					// var previous_heading = page.blocks.length - 1;
					// if (typeof page.blocks[previous_heading].import_rule == "undefined") {
					//     page.blocks[previous_heading].import_rule = []
					// }
					// page.blocks[previous_heading].import_rule.push(rule.path)
				}
			});

			page.css = stylesheet.toCSS({ compress: true });
			page.css = ".kalei-page{" + page.css + "}";
			page.css = stylesheet.toCSS({ compress: true });
			return page;
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
			var block_def = {
				content: [],
				heading: "",
			};

			var block = _.clone(block_def);

			_.each(lexedCommentblock, function (comment) {
				switch (comment.type) {
					case "code":
						// If there's no language:
						if (!comment.lang) {
							// Push the code without example nor language header.
							block.content.push(comment);
						// If the code is not "markup" (html):
						} else if (comment.lang !== 'markup') {
							// Push the code without example but with language header.
							block.content.push({
								type: 'html',
								text: '<div class="code-lang">' + comment.lang + '</div>'
							});
							block.content.push(comment);
						// If it's "markup" (html):
						} else {
							// Push the code for an example with language header.
							block.content.push({
								type: 'html',
								text: '<div class="code-render clearfix">' + comment.text + '</div>' +
										'<div class="code-lang">html</div>'
							});
							block.content.push(comment);
						}
						break;
					case "heading":
						if (block.heading != "" && comment.depth === 1) {
							// Multiple headings in one comment block.
							// We want to break them up.
							// Parse the content blocks and return the HTML to display.
							block.content.links = lexerLinks
							block.content = marked.parser(block.content)
							return_val.push(block);
							block = _.clone(block_def);
						}
						if (comment.depth === 1) {
							block.heading = comment.text;
							block.content.push(comment);
						} else if (comment.depth >= 2) {
							block.stylesheet = comment.text;
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
			block.content.links = lexerLinks
			block.content = marked.parser(block.content)

			return_val.push(block);
			return return_val;
		},

	});
	return StylePage;
});
