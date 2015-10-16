/*
 * @package	Auth
 * @module	Http/Controllers/Auth
 */
var Controller = extend('controller');

function Auth(request, response) {

    var self = this;

    Controller.call(this, request, response); 

    self.login = function () {

    	var query = {};

    	query[getConfig('auth', 'identity_key')] = self.request.params[getConfig('auth', 'identity_key')];
    	query[getConfig('auth', 'credential_key')] = hash(self.request.params[getConfig('auth', 'credential_key')]);

    	self.model.findOne(query, function(result, err) {
			if(isEmpty(err)) {

				var token = ada.services.jwt.sign(result);
				var user = ada.services.hal.document(result, self.model);
				
				delete user.iat;
				delete user.exp;

				self.response.send({
					'jwt': {
						'token' : token,
						'issued_at' : result.iat,
						'expires_on' : result.exp
					},
					'user': user
				});
				
			}
			else {

				self.response.send(new ada.restify.InvalidCredentialsError('Authentication failed.'));
			
			}
		});

    };

    self.register = function () {

    	if(!isEmpty(self.request.params.password)) {
			self.request.params.password = hash(self.request.params.password);	
		}
		
		self.model.create(self.request.params, function(doc, result, err){
			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				var body = {};
				body.message = 'User created';
				body[self.model.documentURI] = doc;
				self.response.send(201, body);
			}
		});

    };

}

Auth.prototype = Object.create(Controller.prototype);
Auth.prototype.constructor = Controller;

module.exports = Auth;