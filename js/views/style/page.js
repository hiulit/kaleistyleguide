define([
	'jquery',
	'underscore',
	'backbone',
	'libs/marked/marked',
	'text!templates/style/page.html',
	'config',
	'jscssp',
	'libs/prism/prism',
	'libs/parseuri/parseuri',
	'libs/less/less-1.3.3.min'
],
function($, _, Backbone, marked, stylePageTemplate, config, jscssp, parseuri){
	var that = null;
	var StylePage = Backbone.View.extend({
		el: '.phytoplankton-page',
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
					configPath = config.css_paths[0].substr(config.css_paths[0].lastIndexOf('/'));
					configDir =	window.location.protocol + '//' +
								window.location.hostname +
								(window.location.port === '' ? '' : ':'+ window.location.port) +
								window.location.pathname;
					styleUrl = configDir + 'scss' + configPath;
					window.location.href = configDir + '#' + configPath;
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

				var page = {blocks:[]};

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
							// // Embeds CSS styles in <head>.
							// var style = document.createElement('style');
							// var attr = document.createAttribute('id');
							// var fileName = styleUrl.substr(styleUrl.lastIndexOf('/')+1);
							// fileName = fileName.substr(0, fileName.lastIndexOf('.'));
							// attr.value = fileName;
							// style.setAttributeNode(attr);
							// style.textContent = stylesheetCompiled;
							// if(!$('style[id="' + fileName + '"]').length) {
							// 	document.head.appendChild(style);
							// }
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

				$('.phytoplankton-sheet-submenu').hide();
				var submenu = $('<ul>');

				////////////NEEDS TO BE EXPORTED TO Menu.js
				headingArray = [];
				var i = 2;
				_.each(page.blocks, function (block) {
					if (block.heading) {
						if(headingArray.lastIndexOf(block.headingID) !== -1) {
							block.headingID = block.headingID + i;
							headingArray.push(block.headingID);
							i++;
						} else {
							headingArray.push(block.headingID);
						}
						var li = $('<li>');
						li.append($('<a href="#' + block.headingID + '">').text(block.heading));
						submenu.append(li);
					}
					if (block.subheading) {
						var ul = $('<ul>');
						for(j = 0; j < block.subheadingArray.length; j++) {
							if(headingArray.lastIndexOf(block.subheadingIDArray[j]) !== -1) {
								block.subheadingIDArray[j] = block.subheadingIDArray[j] + i;
								headingArray.push(block.subheadingIDArray[j]);
								i++;
							} else {
								headingArray.push(block.subheadingIDArray[j]);
							}
							var li = $('<li>');
							li.append($('<a href="#' + block.subheadingIDArray[j] + '">').text(block.subheadingArray[j]));
							console.log(li);
							ul.append(li);
						}
						submenu.find('li:last').append(ul);
					}
				});

				$('li:first-child', submenu).addClass('active');
				$('.phytoplankton-sheet-submenu', $('[data-sheet="' + that.options.style + '"]')).html(submenu).show();
				////////////NEEDS TO BE EXPORTED TO Menu.js

				$(that.el).html(_.template(stylePageTemplate, {_:_, page: page, config: config}));

				// Prism's colour coding in <code> blocks.
				Prism.highlightAll();
				// Prism's File Highlight plugin function.
				fileHighlight();
				// Call for Fixie.
				fixie.init();

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

				$(window).scroll(function () {
					var k = 0;
					$('.phytoplankton-page__item').find(':header').each(function(i) {
						if(!$(this).parent().parent().hasClass('code-render')) {
							if(that.is_on_screen($(this), 30)) {
								hash = window.location.hash;
								hash = hash.substr(hash.lastIndexOf('#') + 2);
								$('.phytoplankton-sheet-submenu li').removeClass('active');
								$('.phytoplankton-menu__list__item[data-sheet="' + hash + '"]').find($('.phytoplankton-sheet-submenu li')).eq(k).addClass('active');
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
						var pageHeight = $(window).height();
						var lastElHeight = $('.phytoplankton-page__item:last').outerHeight(); // outerHeight() returns height + padding).
						var lastElPaddingTop = $('.phytoplankton-page__item:last').css('padding-top');
						var lastElPaddingBottom = $('.phytoplankton-page__item:last').css('padding-bottom');
						lastElPaddingTop = parseInt(lastElPaddingTop.substr(0, lastElPaddingTop.length - 2)); // Removes px from string and converts string to number.
						lastElPaddingBottom = parseInt(lastElPaddingBottom.substr(0, lastElPaddingBottom.length - 2)); // Removes px from string and converts string to number.
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
						// We need to import jsscp doesn't compile imports.
						if(window.location.hash === '') {
							result = $('.phytoplankton-menu__list__item__link').attr('href');
							window.location.href =	window.location.protocol +
													'//' + window.location.hostname +
													(window.location.port === '' ? '' : ':'+ window.location.port) +
													window.location.pathname + result;
						}
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

			var parser = new(less.Parser);
			var stylesheet;
			page.css = '.code-render { ' + page.css + ' }';
			parser.parse(page.css, function (err, tree) {
				stylesheet = tree;
			});

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
				heading: '',
				subheadingArray: [],
				subheadingIDArray: [],
			};

			var block = _.clone(block_def);

			_.each(lexedCommentblock, function (comment) {
				switch (comment.type) {
					case 'code':
						// If there's no language:
						// Push the code without example nor language header.
						if (!comment.lang) {
							block.content.push(comment);
						// If the code is not "markup" (html):
						// Push the code without example but with language header.
						} else if (comment.lang !== 'markup') {
							block.content.push({
								type: 'html',
								text: '<div class="code-lang">' + comment.lang + '</div>'
							});
							block.content.push(comment);
						// If it's "markup" (html):
						// Push the code for an example with language header.
						} else {
							block.content.push({
								type: 'html',
								text: '<div class="code-render clearfix">' + comment.text + '</div>' +
										'<div class="code-lang">html</div>'
							});
							block.content.push(comment);
						}
						break;
					case 'heading':
						if (block.heading !== '' && comment.depth === 1) {
							// Multiple headings in one comment block.
							// We want to break them up.
							// Parse the content blocks and return the HTML to display.
							block.content.links = lexerLinks;
							block.content = marked.parser(block.content);
							return_val.push(block);
							block = _.clone(block_def);
						}
						if (comment.depth === 1) {
							block.heading = comment.text;
							block.headingID = block.heading.toLowerCase().replace(/\W+/g, '-');
							block.content.push(comment);
						} else if (comment.depth >= 2) {
							block.subheading = comment.text;
							block.subheadingID = block.subheading.toLowerCase().replace(/\W+/g, '-');

							block.subheadingArray.push(block.subheading);
							block.subheadingIDArray.push(block.subheadingID);

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
