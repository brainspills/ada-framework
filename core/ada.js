/*
 * @package	Ada Framework
 * @module	Core/Main
 */
module.exports = function Ada() {

	var self = this;

	self.bootstrap = function()
	{

		// Load Configuration
		require(process.env.PWD+'/core/config.js').build();

		// Register Services
		self.services = require(process.env.PWD+'/core/service.js').register();

		// Create Server
		self.restify = require('restify');
		self.server = self.restify.createServer({
			name: getConfig('server', 'name'),
			formatters: {
		        'application/hal+json': function (req, res, body) {
		            return res.formatters['application/json'](req, res, body);
		        }
		    }
		});
		self.server.use(self.restify.authorizationParser());
		self.server.use(self.restify.queryParser());
		self.server.use(self.restify.bodyParser());

		if(parseInt(getConfig('app', 'debug')) == 1) {
			require('util').log('Debug: Debugging enabled');
			var morgan = require('morgan');
			self.server.use(morgan('dev'));	
		}
		
		// Register Routes
		self.routes = require(process.env.PWD+'/core/router.js').register(self.server);
		
	};

	self.listen = function()
	{

		// Listen for incoming requests
		self.server.listen(getConfig('server', 'port'), function() {

			require('util').log('Server: ' + getConfig('server', 'name') + ' listening on port ' + getConfig('server', 'port'));

		});

		if(parseInt(getConfig('app', 'debug')) == 1) {
			self.server.on('uncaughtException', function(request, response, route, error) {
				console.log(error.stack);
			});
		}

	};

	self.serve = function() 
	{

		// Start server
		self.bootstrap();
		self.listen();

	};

};