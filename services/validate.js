/*
 * @package	Ada Framework
 * @module	Services/Validate
 */
 var Validate = {

 	test : null,

	init : function() {

		console.log('Validate: Intializing validation service...');
		Validate.test = require('validate.js');

	}

};

module.exports = Validate;