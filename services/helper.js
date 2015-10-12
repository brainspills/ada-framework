/*
 * @package	ARK API
 * @module	Services/Helper
 */
 var Helper = {

	init : function() {

		console.log('Helper: Intializing helper service...');

		global.loadModel = function(model) {

			var Model = require(__dirname+'/../models/' + model + '.js');
			return new Model();

		};

		global.isEmpty = function(obj) {

			if (typeof obj === 'undefined') return true;
		    if (obj === null) return true;
		    if (obj.length > 0) return false;
		    if (obj.length === 0) return true;
		    
		    for (var key in obj) {
		        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
		    }

		    return true;
		    
		};

		global.hash = function(string) {

			var HmacSHA1 = require('crypto-js/hmac-sha1');
			var EncBase64 = require('crypto-js/enc-base64');
			return HmacSHA1(string, getConfig('server', 'key')).toString(EncBase64);

		};

	}

};

module.exports = Helper;