define({
	// This path is used as a default by the Kalei project itself.
	// This is the preferred way to go!

	css_path: window.location.protocol + '//' +
				window.location.hostname +
				(window.location.port === '' ? '' : ':'+ window.location.port) +
				window.location.pathname +
				'css/imports.css',

	// You can configure any path you want.
	// Not supported yet!!!

	// css_path_url: 'http://localhost/kaleistyleguide/css/imports.css',

	// You can manually list the css files to process by giving a css_paths array:
	// This is option is the least recommended because of its poor UI experience.
	// You don't get the benefits of having the 'imports.css' #Titles rendered as headings.
	// You just get a list of the style sheets, just as it is.
	// And also it's a bit buggy :P

	// css_paths: ['scss/readme.scss', 'scss/examples/buttons.scss'],

	// You can optionally set configuration for marked.js
	marked_options: {
		tables: true,
		langPrefix: 'language-'
	}
});
