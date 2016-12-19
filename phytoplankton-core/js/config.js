define({

	// Your style guide folder.
	styleguideFolder: "phytoplankton-styleguide",

    // Your main style sheet where you have all your "@import".
    // No need for the extension file.
    mainPreprocessorStyleSheet: "preprocessors/main",

	// Set menu.
	menu: [
		{
			title: "Phytoplankton Style Guide",
			url: [
				"readme.css"
			]
		},
		{
			title: "Documentation",
			url: [
				"docs/documentation.css"
			]
		},
		{
			title: "Prepocessors",
			url: [
				"preprocessors/less.less",
				"preprocessors/scss.scss",
				"preprocessors/stylus.styl"
			]
		},
		{
			title: "Plugins",
			url: [
				"plugins/fixie.css",
				"plugins/handlebars.css",
				"plugins/prism.css"
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
