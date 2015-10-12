// Require parent controller
var Controller = extend('controller');

// Define child controller
function Reference(request, response) {

	var self = this;

	Controller.call(this, request, response); 

	self.getRoutes = function () {

		var routes = [];
		var data = [];

		for(var i=0; i<ada.routes.length; i++) {
			if(ada.routes[i].meta.desc) {
				if(ada.routes[i].meta.live) {
					routes.push(ada.routes[i]);
				}	
			}
		}

		for(i=0; i<routes.length; i++) {

			if(routes[i].method == 'del') {
				routes[i].method = 'DELETE';
			}
			
			var endpoint = {
				'method': routes[i].method.toUpperCase(),
				'route' : routes[i].route,
				'desc'	: routes[i].meta.desc,
				'scope' : routes[i].meta.scope,
				'public': (routes[i].meta.noauth) ? 1 : 0
			};
			
			if(routes[i].binding.model) {
				var model = loadModel(routes[i].binding.model);
				endpoint.schema = model.schema;
				if(routes[i].binding.keys) {
					endpoint.keys = routes[i].binding.keys;	
				}
			}

			data.push(endpoint);
		}

		return data;

	};

	self.reference = function () {

		var fs = require('fs');

		var body = fs.readFileSync(process.env.PWD+'/packages/reference/pages/reference.html');
		body = body.toString().replace("['routes_data']", JSON.stringify(self.getRoutes()));
		body = body.toString().replace(new RegExp('<SERVER_NAME>', 'g'), getConfig('server', 'name'));
		
		self.response.writeHead(200, {
		  'Content-Type': 'text/html'
		});
		self.response.write(body);
		self.response.end();

	};

	self.browser = function() {

		var fs = require('fs');
		var body = fs.readFileSync(process.env.PWD+'/packages/reference/pages/browser.html');
		body = body.toString().replace("['routes_data']", JSON.stringify(self.getRoutes()));
		body = body.toString().replace(new RegExp('<SERVER_NAME>', 'g'), getConfig('server', 'name'));
		
		self.response.writeHead(200, {
		  'Content-Type': 'text/html'
		});
		self.response.write(body);
		self.response.end();

	};

}

// Inherit parent controller
Reference.prototype = Object.create(Controller.prototype);
Reference.prototype.constructor = Controller;

// Package controller
module.exports = Reference;