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

			$('.kalei-styleguide-menu-link').removeClass('active');
			if(window.location.hash === '') {
				$('.js-kalei-home').addClass('active');
			} else {
				$('[href="' + window.location.hash + '"]').addClass('active');
			}

			var styleUrl;
			var configDir;

			if(this.options.style === null) {
				this.options.style = config.css_path.substr(config.css_path.lastIndexOf('/')+1);
			}

			if(this.options.style.substr(0,1) === '/') {
				// Non relative.
				configDir = config.css_path.substr(0, config.css_path.lastIndexOf('/'));
				var pUrl = parseuri(configDir);
				styleUrl = pUrl.protocol + '://' + pUrl.host + (pUrl.port === '' ? '' : ':'+ pUrl) + this.options.style;
			} else {
				configDir = config.css_path.substr(0, config.css_path.lastIndexOf('/'));
				styleUrl = configDir + '/' + this.options.style;
			}

			var styleExt = styleUrl.replace(/^.*\./,''); // Returns file extension.

			// If config.css_path stylesheet (default = 'style.css') is already loaded, don't load it again.
			if(!$('link[href="' + config.css_path + '"]').length) {
				$('head').append('<link rel="stylesheet" href="' + config.css_path + '"" type="text/' + styleExt +'" />');
			}
			// If any other stylesheet is already loaded, don't load it again.
			if(!$('link[href="' + styleUrl + '"]').length) {
				$('head').append('<link rel="stylesheet" href="' + styleUrl + '"" type="text/' + styleExt +'" />');
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

							var result = [];
							var outerRegex = /@import[ \("']*([^;]+)[;\)"']*/g;
							var innerRegex = /@import[ \("']*([^;]+)[;\)"']*/g;
							var outerMatch = null;
							while (outerMatch = outerRegex.exec(stylesheet)) {
								if (outerMatch.index == outerRegex.lastIndex) {
									outerRegex.lastIndex++;
								}
								var innerSubject = stylesheet.substr(outerMatch.index, outerMatch[0].length);
								var innerMatch = null;
								while (innerMatch = innerRegex.exec(innerSubject)) {
									if (innerMatch.index == innerRegex.lastIndex) {
										innerRegex.lastIndex++;
									}
									result.push(innerMatch[0]);
									console.log(result);
								}
							}

							var importReg = /@import[ \("']*([^;]+)[;\)"']*/g;
							var result;

							while ((result = importReg.exec(stylesheet)) !== null ) {
								var subash = result[1];
								// console.log(subash);
								subash = subash.replace(/"|'/gi, "");
								// console.log(subash);
								subash = subash.split(",");
								// console.log(subash);
								for(i=0; i<subash.length; i++) {

									var path = subash[i].trim();
									console.log('@import ----> ' + path, importReg.lastIndex);
									url = styleUrl.replace(/(.*)\/.*(\.scss$)/i, '$1/_'+path+'$2'); // Needs improvement
									console.log('url ----> ' + url);

									var text = Sass.readFile(path) || Module.read(url);
									Sass.writeFile(path, text);
									console.log('path ----> ', path);
									// console.log('text ----> ', text);

									// importReg.lastIndex++;

									var importReg2 = /@import[ \("']*([^;]+)[;\)"']*/g;

									while ((result = importReg2.exec(text)) !== null ) {
										var subash = result[1];
										// console.log(subash);
										subash = subash.replace(/"|'/gi, "");
										// console.log(subash);
										subash = subash.split(",");
										// console.log(subash);
										for(i=0; i<subash.length; i++) {

											var path = subash[i].trim();
											console.log('@import ----> ' + path, importReg.lastIndex);
											url = styleUrl.replace(/(.*)\/.*(\.scss$)/i, '$1/_'+path+'$2'); // Needs improvement
											console.log('url ----> ' + url);

											var text2 = Sass.readFile(path) || Module.read(url);
											Sass.writeFile(path, text2);
											console.log('path ----> ', path);
											// console.log('text ----> ', text);

											// importReg2.lastIndex++;
										}
									}
								}
							}

							Sass.writeFile(styleUrl, stylesheet);
							console.log('styleUrl ---> ', styleUrl);
							console.log('stylesheet ---> ', stylesheet);

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


				$('.kalei-sheet-submenu').slideUp(200);
				var submenu = $('<ul>');

				////////////NEEDS TO BE EXPORTED TO Menu.js
				_.each(page.blocks, function (block) {
					if (block.heading != "") {
						var li = $('<li>');
						li.append($('<span>').text(block.heading));
						submenu.append(li);
					}

				});
				$('li:first-child', submenu).addClass('active');
				$('.kalei-sheet-submenu', $('[data-sheet="' + that.options.style + '"]')).html(submenu).slideDown(200);
				////////////NEEDS TO BE EXPORTED TO Menu.js

				$(that.el).html(_.template(stylePageTemplate, {_:_, page: page, config: config}));

				// Colour Coding in code Block.
				Prism.highlightAll();
				fileHighlight(); // Prism's File Highlight plugin function.

				//Fixed by pivanov
				//that.compute_css
				$(".kalei-sheet-submenu li").on('click', function(ev) {
					$('html, body').animate({
						scrollTop: $(".kalei-page__item h1:contains('"+$(ev.currentTarget).text()+"')," +
										 ".kalei-page__item h2:contains('"+$(ev.currentTarget).text()+"')").offset().top - 60
					}, '200');
				});

				$(window).scroll(function () {
					$(".kalei-page__item").each(function(){
						if ( that.is_on_screen($(this), 60) ) {
							$(".kalei-sheet-submenu li").removeClass('active');
							$(".kalei-sheet-submenu li:contains('" + $(this).find('> h1').text() +"')," +
								 ".kalei-sheet-submenu li:contains('" + $(this).find('> h2').text() +"')").addClass('active');
						}
					});
				});

				fixie.init();

				// Add more space at the bottom of the page to avoid scrolling to last node from menu.
				// But we can think for something more smarter.

				// Now it works like a charm! Fixed by: @hiulit
				//If the last element of the page is higher than window.height(),
				// some additional padding-bottom is added so it stops at the top of the page.
				// If the last element is lower, it doesn't add any padding-bottom.

				var pageHeight = $(window).height(); // Returns height of browser viewport.
				var lastElHeight = $('.kalei-page__item:last').outerHeight(); // Returns height of last item (.outerHeight() returns height + padding).
				var lastElPaddingTop = $('.kalei-page__item:last').css( 'padding-top'); // Returns padding-top of last item.
				var lastElPaddingBottom = $('.kalei-page__item:last').css( 'padding-bottom'); // Returns padding-bottom of last item.

				lastElPaddingTop = parseInt(lastElPaddingTop.substr(0, lastElPaddingTop.length - 2)); // Removes px from string and converts string to number.
				lastElPaddingBottom = parseInt(lastElPaddingBottom.substr(0, lastElPaddingBottom.length - 2)); // Removes px from string and converts string to number.
				lastElPaddingTotal = lastElPaddingTop+lastElPaddingBottom; // Returns the sum of paddings (top and bottom).

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

			console.log(stylesheet)

			_.each(stylesheet.cssRules, function(rule) {
				switch (rule.type) {
					case 1: // Standard rule?
						break;
					case 3: // Import Rule (@import)
						// We need to import jsscp doesn't compile imports.
						stylesheet.deleteRule(rule);
						break;
					case 101: // Comment Block.
						page.blocks = page.blocks.concat(that.parse_commentblock(rule.parsedCssText))
						break;
				}
			});

			page.css = stylesheet.cssText()

			var parser = new(less.Parser);
			var stylesheet
			page.css = ".kalei-page{" + page.css + "}"
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
				if (rule.silent != null){ // Comment block.
					page.blocks = page.blocks.concat(that.parse_commentblock(rule.value))
					// page.blocks.push();
				} else if (rule.rules != null) { // Standard Rule.

				} else if (rule.path != null) { //Import Rule
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
			//Remove /* & */
			comment_block_text = comment_block_text.replace(/(?:\/\*)|(?:\*\/)/gi, '');

			marked.setOptions(_.extend({
					sanitize: false,
					gfm: true
				},
				config.marked_options || {}
			));

			var lexedCommentblock = marked.lexer(comment_block_text);
			console.log(lexedCommentblock);
			var lexerLinks = lexedCommentblock.links || {}; // Lexer appends definition links to returned token object.

			var return_val = [];
			var block_def = {
				content: [],
				heading: "",
			};

			var block = _.clone(block_def);

			_.each(lexedCommentblock, function (comment) {
				switch (comment.type) {
					case "code":
						if (!comment.lang) { // If there's no language:
							// Push the code without example nor language header.
							block.content.push(comment);

						} else if (comment.lang !== 'markup') { // If the code is not "markup" (html):
							// Push the code without example but with language header.
							block.content.push({
								type: 'html',
								text: '<div class="code-lang">' + comment.lang + '</div>'
							});

							block.content.push(comment);

						} else { // If it's "markup" (html):
							// Push the code for an example with language header.
							block.content.push({
								type: 'html',
								text: '<div class="codedemo clearfix">' + comment.text + '</div>' +
									  '<div class="code-lang">html</div>'
							});

							block.content.push(comment);

						}
						break;
					case "heading":
						if (block.heading != "") {  // Multiple headings in one comment block.
													// We want to break them up.
							// Parse the content blocks and return the HTML to display
							block.content.links = lexerLinks
							block.content = marked.parser(block.content)
							return_val.push(block);
							block = _.clone(block_def);
						}
						if (comment.depth <= 2) {
							block.heading = comment.text;
							block.content.push(comment);
						} else if (comment.depth == 3) { // Import statement title.
							block.stylesheet = comment.text;
							//block.heading = "Stylesheets"
							//this is an import statement
							//if ($.inArray("Stylesheets", ))
							//console.log("else", comment)
						}
						break;
					default:
						// Push everything else.
						block.content.push(comment);
						break;
				} // Switch.
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
