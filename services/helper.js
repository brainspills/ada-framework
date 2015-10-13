/*
 * @package	ARK API
 * @module	Services/Helper
 */
 var Helper = {

	init : function() {

		require('util').log('Helper: Intializing helper service...');

		global.extend = function(corefile) {

			return require(process.env.PWD+'/core/'+corefile+'.js');

		};

		global.loadModel = function(model) {

			var fs = require('fs');

			var Model = null;

			if(fs.existsSync(process.env.PWD+'/models/' + model + '.js')) {								
				Model = require(process.env.PWD+'/models/' + model + '.js');	
			}
			else {

				var packages = fs.readdirSync(process.env.PWD+'/packages');
				
				for(i=0; i<packages.length; i++) {
					var package = packages[i];
					if(fs.existsSync(process.env.PWD+'/packages/'+package+'/models/' + model + '.js')) {
						Model = require(process.env.PWD+'/packages/'+package+'/models/' + model + '.js');	
					}
				}
				
			}
			
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