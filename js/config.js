define({

	// Set menu.
	menu: [
		{
			title: "Phytoplankton Style Guide",
			url: [
				"phytoplankton-examples/readme.scss"
			]
		},
		{
			title: "Documentation",
			url: [
				"phytoplankton-examples/docs/documentation.scss"
			]
		},
		{
			title: "Plugins",
			url: [
				"phytoplankton-examples/plugins/fixie.css",
				"phytoplankton-examples/plugins/handlebars.scss",
				"phytoplankton-examples/plugins/prism.scss"
			]
		},
		{
			title: "LESS",
			url: [
				"phytoplankton-examples/less/styles.less"
			]
		}
	],

	// Set configuration for marked.js
	marked_options: {
		sanitize: false,
		gfm: true,
		tables: true,
		langPrefix: 'language-'
	},

	// Enter URLs of any external stylesheets you wish to include with this demo.
	// These will not be parsed as part of the documentation and are simply loaded into the page header.
	external_stylesheets: []

});
