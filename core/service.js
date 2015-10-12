/*
 * @package	Ada Framework
 * @module	Core/Service Registrar
 */
module.exports = {

	register : function() {

		var fs = require('fs');
		var service_files = fs.readdirSync('./services');

		var services = {};
		
		for(var i=0; i<service_files.length; i++) {
			var index = service_files[i];
			index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
			services[index] = require('./../services/'+service_files[i]);
			services[index].init();
		}

		var packages = fs.readdirSync('./packages');

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync('./packages/'+package+'/services')) {

				var serviceFiles = fs.readdirSync('./packages/'+package+'/services');

				for(var j=0; j<serviceFiles.length; j++) {
			
					for(var k=0; k<serviceFiles.length; k++) {
						var index = serviceFiles[k];
						index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
						services[index] = require('./../packages/'+package+'/services/'+serviceFiles[k]);
						services[index].init();
					}
					
				}
			
			}

		}
		/* jshint ignore:end */

		return services;

	}

};