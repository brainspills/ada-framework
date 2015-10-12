var Writer = require(process.env.PWD+'/tools/generator/writers/writer.js');

function RouteWithModel(name, args) {

	Writer.call(this, name, args); 

	var self = this;
	self.write_to = 'http/routes';
	
	self.process = function() {

		var mainTemplate = new self.Template('route-with-model.tmpl.js')

		.addReplacer('<Name>', self.name, function(name) {
			return self.preset.ucfirst(name);
		})
		.addReplacer('<name>', self.name, function(name) {
			return self.preset.tolower(name);
		})
		.addReplacer('<names>', self.name, function(name) {
			return self.preset.pluralize(name);
		});

		return mainTemplate.getContent();

	};

}

// Inherit parent controller
RouteWithModel.prototype = Object.create(Writer.prototype);
RouteWithModel.prototype.constructor = Writer;

// Package controller
module.exports = RouteWithModel;