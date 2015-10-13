/*
 * @package	Ada Framework
 * @module	HTTP/Route Registry
 */
var Router = {

	register : function(server) 
	{

		var routes = Router.getRoutes();

		for(var i=0; i<routes.length; i++) {
			if(routes[i].meta.live) {
				this.create(server, routes[i]);
			}
		}

		return routes;

	},

	create : function (server, route) 
	{

		require('util').log('Router: Registering route [' + route.method.toUpperCase() + ' ' + route.route +']');

		if(route.method == 'delete') {
			route.method = 'del';
		}

		server[route.method](route.route, function(request, response, next) {

			var router = function() {

				if(!isEmpty(route.request) && !isEmpty(route.request.insert)) {
					for(var key in route.request.insert) {
						switch(route.request.insert[key]) {
							case 'auth.user.id':
								request.params[key] = request.user._id;
							break;
						}
					}
				}

				switch(route.response.type) {

					case 'collection':

						var Collection = require(process.env.PWD+'/core/collection.js');
						var collection = new Collection(request, response, route.binding.model);

					break;

					case 'document':

						var Document = require(process.env.PWD+'/core/document.js');
						var docunent = null;

						if(isEmpty(route.binding.embed)) {
							document = new Document(request, response, route.binding.model);	
						}
						else {
							document = new Document(request, response, route.binding.model, route.binding.embed);
						}
						
					break;

					case 'controller':

						var Controller = null;
						if(isEmpty(route.binding.controller)) {
							Controller = require(process.env.PWD+'/core/controller.js');	
						}
						else {

							var fs = require('fs');
							if(typeof route.binding.controller == 'string') {
								Controller = require(process.env.PWD+'/http/controllers/' + route.binding.controller + '.js');
							}
							else {
								Controller = require(process.env.PWD+'/packages/'+route.binding.controller[0]+'/http/controllers/' + route.binding.controller[1] + '.js');	
							}

						}

						var controller = new Controller(request, response);
						controller._construct(route.binding);
						controller[route.binding.action].call(this);

					break;

				}

				next();
			
			};
			
			var hook = require(process.env.PWD+'/core/hook.js');
			var preRouteHooks = hook.getHooks('preroute');
			var valid = true;

			for(var i=0; i<preRouteHooks.length; i++) {
				hook = preRouteHooks[i];
				if(!hook.call(this, route, request, response)) {
					valid = false;		
					next();
				}
			}

			if(valid) {
				router();
			}

		});
	
	}, 

	getRoutes : function() {

		var routes = [];

		var fs = require('fs');
		var routeFiles = fs.readdirSync(process.env.PWD+'/http/routes');

		for(var i=0; i<routeFiles.length; i++) {
			
			var path = routeFiles[i];
			var filename = path.replace(/^.*[\\\/]/, '');
			var extension = filename.split('.').pop();

			if(extension == 'js') {
				var routeFile = require(process.env.PWD+'/http/routes/'+routeFiles[i]);
				for(j=0; j<routeFile.length; j++) {
					routes.push(routeFile[j]);	
				}
			}
			
		}

		var packages = fs.readdirSync(process.env.PWD+'/packages');

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync(process.env.PWD+'/packages/'+package+'/http/routes')) {

				var routeFiles = fs.readdirSync(process.env.PWD+'/packages/'+package+'/http/routes');

				for(var j=0; j<routeFiles.length; j++) {
			
					var path = routeFiles[j];
					var filename = path.replace(/^.*[\\\/]/, '');
					var extension = filename.split('.').pop();

					if(extension == 'js') {
						var routeFile = require(process.env.PWD+'/packages/'+package+'/http/routes/'+routeFiles[j]);
						for(k=0; k<routeFile.length; k++) {
							routes.push(routeFile[k]);	
						}
					}
					
				}
			
			}

		}
		/* jshint ignore:end */

		return routes;

	}

};

module.exports = Router;