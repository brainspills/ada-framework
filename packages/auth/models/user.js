/*
 * @package	Auth
 * @module	Models/User
 */
var Model = extend('model');

function User() {

	var self = this;

	Model.call(this); 

	self.collectionURI = 'users';
	self.documentURI = 'user'; 

	self.collectionName = 'user';

	self.schema = [
		{
			'key'	 	: 'email',
			'constraints'	: {
				'presence'	: true,
				'email'		: true
			},
			'meta' : {
				'label': 'Email Address',
				'desc': 'Email address of the user'
			}
		},
		{
			'key'	 	: 'handle',
			'constraints'	: {
				'presence'	: true
			},
			'meta' : {
				'label': 'Display Name',
				'desc': 'Name displayed for the user'
			}
		},
		{
			'key'	 	: 'password',
			'constraints'	: {
				'presence'	: true
			},
			'meta' : {
				'label': 'Password',
				'desc': 'Password of the user (stored as a hash)',
				'hidden': true
			}
		},
		{
			'key'	 	: 'firstname',
			'meta' : {
				'label': 'First Name',
				'desc': 'First name of the user'
			}
		},
		{
			'key'	 	: 'lastname',
			'meta' : {
				'label': 'Last Name',
				'desc': 'Last name of the user'
			}
		}
	];

	self.indeces = {
		'email_unique' : {
			'fields' 	: {
				'email'	: 1
			},
			'options'	: {
				'unique': true,
				'sparse': true
			}
		},
		'handle_unique' : {
			'fields' 	: {
				'handle': 1
			},
			'options'	: {
				'unique': true,
				'sparse': true
			}
		}
	};

}

User.prototype = Object.create(Model.prototype);
User.prototype.constructor = Model;

module.exports = User;
