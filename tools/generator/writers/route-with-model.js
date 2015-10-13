var Writer = require(process.env.PWD+'/tools/generator/writers/writer.js');

function RouteWithModel(name, args, pckg) {

	Writer.call(this, name, args, pckg); 

	var self = this;
	self.write_to = 'http/routes';
	
	self.process = function() {

		var template = 'route-with-model-packaged.tmpl.js';
		var packaged = true;

		if(typeof self.pckg === 'undefined') {
			template = 'route-with-model.tmpl.js';
			packaged = false;
		}
		
		var mainTemplate = new self.Template(template)

		.addReplacer('<Name>', self.name, function(name) {
			return self.preset.ucfirst(name);
		})
		.addReplacer('<name>', self.name, function(name) {
			return self.preset.tolower(name);
		})
		.addReplacer('<names>', self.name, function(name) {
			return self.preset.pluralize(name);
		});

		if(packaged) {
			mainTemplate.addReplacer('<package>', self.pckg, function(pckg) {
				return self.preset.tolower(pckg);
			});
		}

		return mainTemplate.getContent();

	};

}

// Inherit parent controller
RouteWithModel.prototype = Object.create(Writer.prototype);
RouteWithModel.prototype.constructor = Writer;

// Package controller
module.exports = RouteWithModel;