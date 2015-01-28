// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
	paths: {
		// Major libraries
		jquery: 'libs/jquery/jquery-1.11.2.min',
		underscore: 'libs/underscore/underscore-min',
		backbone: 'libs/backbone/backbone-min',
		handlebars: 'libs/handlebars/handlebars.min',
		gonzales: 'libs/gonzales/gonzales.min',
		marked: 'libs/marked/marked.min',
		fixie: 'libs/fixie/fixie.min',
		// Require.js plugins
		text: 'libs/require/text',
		order: 'libs/require/order',
		// HTML templates
		templates: '../templates',
		// Handlebars paths
		hbs_context: "hbs/context",
		hbs_helpers: "hbs/helpers"
	},

	// Shim for Handlebars
	shim: {
		handlebars: {
			exports: 'Handlebars'
		}
	},

	urlArgs: '' // Commented so we can debug
	// urlArgs: "bust=" + (new Date()).getTime()

});

// Let's kick off the application
require([
	'views/app',
	'router',
	'vm',
	'fixie'
], function(AppView, Router, Vm){
	var appView = Vm.create({}, 'AppView', AppView);
	appView.render();
	Router.initialize({appView: appView}); // The router now has a copy of all main appview
});
