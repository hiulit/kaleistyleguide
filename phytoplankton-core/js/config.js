define({

	// Your style guide folder.
	styleguideFolder: "phytoplankton-styleguide",

    // Your main.styl (or the like) where you have all your "@import".
    mainPreprocessorStyleSheet: "phytoplankton-examples/preprocessors/main.styl",

	// Set menu.
	menu: [
		{
			title: "Phytoplankton Style Guide",
			url: [
				"phytoplankton-examples/readme.css"
			]
		},
		{
			title: "Documentation",
			url: [
				"phytoplankton-examples/docs/documentation.css"
			]
		},
		{
			title: "Prepocessors",
			url: [
				"phytoplankton-examples/preprocessors/less.less",
				"phytoplankton-examples/preprocessors/scss.scss",
				"phytoplankton-examples/preprocessors/example.styl"
			]
		},
		{
			title: "Plugins",
			url: [
				"phytoplankton-examples/plugins/fixie.css",
				"phytoplankton-examples/plugins/handlebars.css",
				"phytoplankton-examples/plugins/prism.css"
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
