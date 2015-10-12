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

		return services;

	}

};