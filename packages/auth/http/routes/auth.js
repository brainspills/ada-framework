/*
 * @package	Auth
 * @module	Http/Routes/Auth
 */

var routes = [];

if(parseInt(getConfig('auth', 'enable')) == 1) {

	routes = [

		{

			'route'		: getConfig('auth', 'login_path'),
			'method'	: 'post',

			'response'	: {
				'type'	: 'controller',
			},
			
			'binding'	: {
				'controller' : 'auth',
				'action'	 : 'login',
				'model'		 : getConfig('auth', 'model'),
				'keys'		 : [getConfig('auth', 'identity_key'), getConfig('auth', 'credential_key')]
			},

			'meta'		: {
				'desc'	: 'Login and obtain access token',
				'live'	: true,
				'noauth': true	
			}

		},

		{

			'route'		: getConfig('auth', 'register_path'),
			'method'	: 'post',

			'response'	: {
				'type'	: 'controller',
			},
			
			'binding'	: {
				'controller' : 'auth',
				'action'	 : 'register',
				'model'		 : getConfig('auth', 'model')
			},

			'meta'		: {
				'desc'	: 'Register an API user',
				'live'	: true,
				'noauth': true,	
			}

		},

	];

}

module.exports = routes;