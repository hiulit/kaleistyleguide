define(function(){
	return {
		'filtertabs':  {
			name: "Epeli",
			tabs: [
				{
					selected: true,
					label: 'Hola soy label',
					id: '1'
				},
				{
					selected: false,
					label: 'Hola soy label 2',
					id: '2'
				}
			],
			author: {
				firstName: "Alan",
				lastName: "Johnson"
			},
			body: "I Love Handlebars",
			comments: [
				{
					author: {
						firstName: "Yehuda",
						lastName: "Katz"
					},
					body: "Me too!"
				}
			],
			items: [
				{name: "Handlebars", emotion: "love"},
				{name: "Mustache", emotion: "enjoy"},
				{name: "Ember", emotion: "want to learn"}
			]
		}
	};
});