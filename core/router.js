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

		console.log('Router: Registering route [' + route.method.toUpperCase() + ' ' + route.route +']');

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

						var Collection = require(__dirname+'/../core/collection.js');
						var collection = new Collection(request, response, route.binding.model);

					break;

					case 'document':

						var Document = require(__dirname+'/../core/document.js');
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
							Controller = require(__dirname+'/../core/controller.js');	
						}
						else {

							var fs = require('fs');

							if(fs.existsSync(__dirname+'/../http/controllers/' + route.binding.controller + '.js')) {
								
								Controller = require(__dirname+'/../http/controllers/' + route.binding.controller + '.js');	

							}
							else {

								var packages = fs.readdirSync('./packages');
								
								for(i=0; i<packages.length; i++) {
									var package = packages[i];
									if(fs.existsSync('./packages/'+package+'/http/controllers/' + route.binding.controller + '.js')) {
										Controller = require(__dirname+'/../packages/'+package+'/http/controllers/' + route.binding.controller + '.js');	
									}
								}
								
							}

						}
						
						var controller = new Controller(request, response);
						controller._construct(route.binding);
						controller[route.binding.action].call(this);

					break;

				}

				next();
			
			};
			
			//TODO: Routing: Create some kind of a "hooking" mechanism, probably load from http/hooks.js (Make auth as a hook)

			// Reject requests without bearer token unless "meta.noauth" is applied on the route
			if(!route.meta.noauth) {
				ada.services.jwt.verify(request.authorization.credentials, function(err, decoded) {      
					if (err) {
			        	response.send(new ada.restify.NotAuthorizedError("Access token is invalid."));
			        	next();
			      	} else {
			      		//TODO: Routing: implement scopes
			      		request.user = decoded;
			      		router();
			      	}
		    	});
			}
			else {
				router();
			}
			
		});
	
	}, 

	getRoutes : function() {

		var routes = [];

		var fs = require('fs');
		var routeFiles = fs.readdirSync('./http/routes');

		for(var i=0; i<routeFiles.length; i++) {
			
			var path = routeFiles[i];
			var filename = path.replace(/^.*[\\\/]/, '');
			var extension = filename.split('.').pop();

			if(extension == 'js') {
				var routeFile = require('./../http/routes/'+routeFiles[i]);
				for(j=0; j<routeFile.length; j++) {
					routes.push(routeFile[j]);	
				}
			}
			
		}

		var packages = fs.readdirSync('./packages');

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync('./packages/'+package+'/http/routes')) {

				var routeFiles = fs.readdirSync('./packages/'+package+'/http/routes');

				for(var j=0; j<routeFiles.length; j++) {
			
					var path = routeFiles[j];
					var filename = path.replace(/^.*[\\\/]/, '');
					var extension = filename.split('.').pop();

					if(extension == 'js') {
						var routeFile = require('./../packages/'+package+'/http/routes/'+routeFiles[j]);
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