/*
 * @package	Ada Framework
 * @module	Http/Routes
 */

var routes = [
	{
		
		'route'  	: '/',
		'method' 	: 'get',

		'response'	: {
			'type'	: 'controller',
		},
		
		'binding'	: {
			'controller' : 'index',
			'action'	 : 'reference'
		},

		'meta'		: {
			'live'	: true,
			'noauth': true	
		}

	},
	{
		
		'route'  	: '/browser',
		'method' 	: 'get',

		'response'	: {
			'type'	: 'controller',
		},
		
		'binding'	: {
			'controller' : 'index',
			'action'	 : 'browser'
		},

		'meta'		: {
			'live'	: true,
			'noauth': true	
		}

	}
];

var fs = require('fs');
var routeFiles = fs.readdirSync('./http/routes');

for(var i=0; i<routeFiles.length; i++) {
	
	var routeFile = require('./../http/routes/'+routeFiles[i]);
	
	for(j=0; j<routeFile.length; j++) {
		routes.push(routeFile[j]);	
	}

}

module.exports = routes;