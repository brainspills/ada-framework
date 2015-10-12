/*
 * @package	Ada Framework
 * @module	HTTP/Route Registry
 */
module.exports = {

	register : function(server) 
	{

		var routes = require('./../http/routes.js');

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
							Controller = require(__dirname+'/../http/controllers/' + route.binding.controller + '.js');	
						}
						
						var controller = new Controller(request, response);
						controller._construct(route.binding);
						controller[route.binding.action].call(this);

					break;

				}

				next();
			
			};
			
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
	
	}

};