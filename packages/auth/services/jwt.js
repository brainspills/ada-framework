/*
 * @package	Auth
 * @module	Services/JWT
 */
 var JWT = {

 	key : '',
 	exp : 0,
 	jwt : null,

	init : function() {

		console.log('JWT: Intializing JWT service...');

		JWT.key = getConfig('server', 'key');
		JWT.exp = parseInt(getConfig('jwt', 'exp'));
		JWT.jwt = require('jsonwebtoken');

	},

	sign : function(obj) {

		var token = JWT.jwt.sign(obj, JWT.key, {
 			expiresIn: JWT.exp
        });

        return token;

	},

	verify : function(token) {

		try {
			var decoded = JWT.jwt.verify(token, JWT.key);
		} catch(err) {
			return false;
		}

		return decoded;
		
	}

};

module.exports = JWT;