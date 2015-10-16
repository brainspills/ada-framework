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

			if(typeof model == 'string') {
				Model = require(process.env.PWD+'/models/' + model + '.js');
			}
			else {
				Model = require(process.env.PWD+'/packages/'+model[0]+'/models/' + model[1] + '.js');	
			}
			
			return new Model();

		};

		global.getUTCStamp = function() {

			return Math.floor((new Date()).getTime() / 1000);

		};

		global.toHttpDateTime = function(utcStamp) {

			// RFC 2616 = Day (small word), Date Month(small word) Year(full) Hours:Minutes:Seconds GMT
			var moment = require('moment');
			return moment.utc(utcStamp*1000).format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';

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
			return HmacSHA1(string, getConfig('app', 'key')).toString(EncBase64);

		};

	}

};

module.exports = Helper;