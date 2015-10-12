/*
 * @package	ARK API
 * @module	Tools/Generator
 */
module.exports = function Writer(name, args) {

	var self = this;
	
	self.name = name;
	self.args = (typeof args === 'undefined') ? [] : args.split(',');
	self.content = '';

	self.preset = {

		pluralize : function(string) {
			var pluralize = require('pluralize');
			return pluralize(string);
		},

		tolower : function(string) {
			return string.toLowerCase();
		},

		ucfirst : function(string) {
			return string.toLowerCase().charAt(0).toUpperCase() + string.slice(1);
		}

	};

	self.write = function() {

		var fs = require('fs');
		var filename = './'+self.write_to+'/'+name.toLowerCase()+'.js';
		fs.writeFileSync(filename, self.content);

		console.log('Written to ' + filename);

	};

	self.Template = function(name) {

		var self = this;
		self.name = name;
		self.replacers = [];

		var fs = require('fs');
		self.template = fs.readFileSync('./tools/generator/templates/'+self.name);
		self.content = self.template.toString();

		self.getContent = function() {

			for(var i=0; i<self.replacers.length; i++) {
				var replacer = self.replacers[i];
				self.content = self.content.replace(new RegExp(replacer.find, 'g'), replacer.replacer.call(this, replacer.args));
			}

			return self.content;

		};

		self.addReplacer = function(find, args, replacer) {
			self.replacers.push({
				'find' : find,
				'args' : args,
				'replacer': replacer
			});
			return self;
		};

		/** Add default timestamp replacer **/
		self.addReplacer('<timestamp>', '', function(args){
			var moment = require('moment');
			var timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
			return timestamp;
		});

		return self;

	};

};