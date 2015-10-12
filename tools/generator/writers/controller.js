var Writer = require(process.env.PWD+'/tools/generator/writers/writer.js');

function Controller(name, args, pckg) {

	Writer.call(this, name, args, pckg); 

	var self = this;
	self.write_to = 'http/controllers';
	
	self.process = function() {

		var mainTemplate = new self.Template('controller.tmpl.js')

		.addReplacer('<Name>', self.name, function(name) {
			return self.preset.ucfirst(name);
		})
		.addReplacer('<actions>', self.args, function(actions) {
			
			var out = '';

			/*jshint -W083 */
			for(var i=0; i<actions.length; i++) {
				
				var actionTemplate = new self.Template('controller-actions.tmpl.js')

				.addReplacer('<name>', actions[i], function(name) {
					return self.preset.tolower(name);
				});
				
				out += actionTemplate.getContent();
			
			}
			/*jshint +W083 */

			return out;

		});

		return mainTemplate.getContent();

	};

}

// Inherit parent controller
Controller.prototype = Object.create(Writer.prototype);
Controller.prototype.constructor = Writer;

// Package controller
module.exports = Controller;