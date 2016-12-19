define({

	// Your style guide folder.
	styleguideFolder: "phytoplankton-styleguide",

    // Your main.styl (or the like) where you have all your "@import".
    // No need for the extension file.
    mainPreprocessorStyleSheet: "phytoplankton-examples/preprocessors/main",

	// Set menu.
	menu: [
		{
			title: "Phytoplankton Style Guide",
			url: [
				"css/phytoplankton-examples/readme.css"
			]
		},
		{
			title: "Documentation",
			url: [
				"css/phytoplankton-examples/docs/documentation.css"
			]
		},
		{
			title: "Prepocessors",
			url: [
				"less/phytoplankton-examples/preprocessors/less.less",
				"scss/phytoplankton-examples/preprocessors/scss.scss",
				"styl/phytoplankton-examples/preprocessors/stylus.styl"
			]
		},
		{
			title: "Plugins",
			url: [
				"css/phytoplankton-examples/plugins/fixie.css",
				"css/phytoplankton-examples/plugins/handlebars.css",
				"css/phytoplankton-examples/plugins/prism.css"
			]
		}
	],

	// Set configuration for marked.js.
	marked_options: {
		sanitize: false,
		gfm: true,
		tables: true,
		langPrefix: 'language-'
	},

	// Handlebars templates path.
	hbs_template_path: "phytoplankton-core/templates/hbs/",

	// External scripts you may need to use.
	external_scripts_path: 'phytoplankton-core/js/external-scripts/',

	// Enter URLs of any external stylesheets you wish to include.
	// These will not be parsed as part of the documentation and are simply loaded into the page's header.
	external_stylesheets: []

});
