/*
 * @package	Ada Framework
 * @module	Core/Service Registrar
 */
module.exports = {

	register : function() {

		var fs = require('fs');
		var service_files = fs.readdirSync(process.env.PWD+'/services');

		var services = {};
		
		for(var i=0; i<service_files.length; i++) {
			var index = service_files[i];
			index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
			services[index] = require(process.env.PWD+'/services/'+service_files[i]);
			services[index].init();
		}

		var packages = fs.readdirSync(process.env.PWD+'/packages');

		//TODO: Namespace services

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync(process.env.PWD+'/packages/'+package+'/services')) {

				var serviceFiles = fs.readdirSync(process.env.PWD+'/packages/'+package+'/services');

				for(var j=0; j<serviceFiles.length; j++) {
			
					for(var k=0; k<serviceFiles.length; k++) {
						var index = serviceFiles[k];
						index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
						services[index] = require(process.env.PWD+'/packages/'+package+'/services/'+serviceFiles[k]);
						services[index].init();
					}
					
				}
			
			}

		}
		/* jshint ignore:end */

		return services;

	}

};