var Writer = require(process.env.PWD+'/tools/generator/writers/writer.js');

function Model(name, args, pckg) {

	Writer.call(this, name, args, pckg); 

	var self = this;
	self.write_to = 'models';
	
	self.process = function() {

		var mainTemplate = new self.Template('model.tmpl.js')

		.addReplacer('<Name>', self.name, function(name) {
			return self.preset.ucfirst(name);
		})
		.addReplacer('<name>', self.name, function(name) {
			return self.preset.tolower(name);
		})
		.addReplacer('<names>', self.name, function(name) {
			return self.preset.pluralize(name);
		})
		.addReplacer('<keys>', self.args, function(keys) {
			
			var out = '';

			/*jshint -W083 */
			for(var i=0; i<keys.length; i++) {
				
				var keyTemplate = new self.Template('model-keys.tmpl.js')

				.addReplacer('<Name>', keys[i], function(name) {
					return self.preset.ucfirst(name);
				})
				.addReplacer('<name>', keys[i], function(name) {
					return self.preset.tolower(name);
				});
				
				out += keyTemplate.getContent();
			
			}
			/*jshint +W083 */

			out = out.replace(/,\s*$/, "");

			return out;

		});

		return mainTemplate.getContent();

	};

}

// Inherit parent controller
Model.prototype = Object.create(Writer.prototype);
Model.prototype.constructor = Writer;

// Package controller
module.exports = Model;