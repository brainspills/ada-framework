/*
 * @package	Auth
 * @module	Services/JWT
 */
 var JWT = {

 	key : '',
 	exp : 0,
 	jwt : null,

	init : function() {

		require('util').log('JWT: Intializing JWT service...');

		JWT.key = getConfig('app', 'key');
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

		var decoded = {};
		
		try {
			decoded = JWT.jwt.verify(token, JWT.key);
		} catch(err) {
			return false;
		}

		return decoded;

	}

};

module.exports = JWT;