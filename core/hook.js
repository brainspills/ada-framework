/*
 * @package	Ada Framework
 * @module	Core/Hook
 */
var Hook = {

	getHooks : function(identifier) {

		var fs = require('fs');

		var out = [];
		
		var paths = [];
		var path = '';
		
		paths.push(process.env.PWD+'/http/hooks.js');

		var packages = getConfig('app', 'packages');
		for(var i=0; i<packages.length; i++) {
			var package = packages[i];
			path = process.env.PWD+'/packages/'+package+'/http/hooks.js';
			if(fs.existsSync(path)) {
				paths.push(path);
			}
		}

		for(i=0; i<paths.length; i++) {

			path = paths[i];
			
			var hooks = require(path);

			for(var j=0; j<hooks.length; j++) {
				var hook = hooks[j];
				if(hook.type == identifier) {
					out.push(hook.callback);
				}
			}

		}

		return out;

	}

};

module.exports = Hook;