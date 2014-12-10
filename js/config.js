define({

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
				"phytoplankton-examples/preprocessors/scss.scss"
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

	// Handlebars configurable paths.
	hbs_template_path: "templates/hbs/",
	hbs_context_path: "hbs/context",
	hbs_helpers_path: "hbs/helpers",

	// Enter URLs of any external stylesheets you wish to include with this demo.
	// These will not be parsed as part of the documentation and are simply loaded into the page header.
	external_stylesheets: []

});
