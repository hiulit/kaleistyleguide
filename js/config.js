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
			title: "Hola",
			url: [
				"phytoplankton-examples/_hola.scss"
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
				"phytoplankton-examples/preprocessors/stylus.styl"
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
	hbs_template_path: "templates/hbs/",

	// External scripts you may need to use.
	external_scripts_path: 'js/external-scripts/',

	// Enter URLs of any external stylesheets you wish to include.
	// These will not be parsed as part of the documentation and are simply loaded into the page header.
	external_stylesheets: []

});
