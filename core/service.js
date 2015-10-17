/*
 * @package	Ada Framework
 * @module	Core/Service Registrar
 */
module.exports = {

	register : function() {

		var fs = require('fs');

		var services = {};
		var paths = [];
		var path = '';
		paths.push(process.env.PWD+'/services');

		var packages = getConfig('app', 'packages');
		for(var i=0; i<packages.length; i++) {
			var package = packages[i];
			path = process.env.PWD+'/packages/'+package+'/services';
			if(fs.existsSync(path)) {
				paths.push(path);
			}
		}

		for(i=0; i<paths.length; i++) {

			path = paths[i];
			var service_files = fs.readdirSync(path);
			
			for(var j=0; j<service_files.length; j++) {
				
				var index = service_files[j];
				var filename = index.replace(/^.*[\\\/]/, '');
				var extension = filename.split('.').pop();

				if(extension == 'js') {
					index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
					services[index] = require(path+'/'+service_files[j]);
					services[index].init();
				}

			}

		}

		return services;

	}

};