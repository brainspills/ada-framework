/*
 * @package	Ada Framework
 * @module	Core/Hook
 */
var Hook = {

	getHooks : function(identifier) {

		var out = [];

		var fs = require('fs');

		if(fs.existsSync(process.env.PWD+'/http/hooks.js')) {

			var hooks = require(process.env.PWD+'/http/hooks.js');

			for(var j=0; j<hooks.length; j++) {
				var hook = hooks[j];
				if(hook.type == identifier) {
					out.push(hook.callback);
				}
			}

		}

		var packages = fs.readdirSync(process.env.PWD+'/packages');

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync(process.env.PWD+'/packages/'+package+'/http/hooks.js')) {

				var hooks = require(process.env.PWD+'/packages/'+package+'/http/hooks.js');

				for(var j=0; j<hooks.length; j++) {
					var hook = hooks[j];
					if(hook.type == identifier) {
						out.push(hook.callback);
					}
				}

			}

		}
		/* jshint ignore:end */

		return out;

	}

};

module.exports = Hook;