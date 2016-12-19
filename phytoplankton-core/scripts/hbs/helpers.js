define([
	'handlebars'
],
function(Handlebars){
	Handlebars.registerHelper('fullName', function(person) {
		return person.firstName + " " + person.lastName;
	});
	Handlebars.registerHelper('agree_button', function() {
		var emotion = Handlebars.escapeExpression(this.emotion),
				name = Handlebars.escapeExpression(this.name);

		return new Handlebars.SafeString(
			"<button>I agree. I " + emotion + " " + name + "</button>"
		);
	});
});