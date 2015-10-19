/*
 * @package	Ada Framework
 * @module	Core/Configuration Builder
 */
var Config = {

	build : function() {

		// Check configuration keys
		Config.synchronize();

		// Load configuration from .env
		require('dotenv').load();

		var fs = require('fs');

		var paths = [];
		var path = '';
		paths.push(process.env.PWD+'/config');

		var packages = require(process.env.PWD+'/config/app.js').packages;
		for(var i=0; i<packages.length; i++) {
			var package = packages[i];
			require('util').log('Package enabled: ' + package);
			path = process.env.PWD+'/packages/'+package+'/config';
			if(fs.existsSync(path)) {
				paths.push(path);
			}
		}

		ada.config = {};

		for(i=0; i<paths.length; i++) {

			path = paths[i];
			var config_files = fs.readdirSync(path);
			var services = {};
			
			for(var j=0; j<config_files.length; j++) {
				
				var index = config_files[j];
				var filename = index.replace(/^.*[\\\/]/, '');
				var extension = filename.split('.').pop();

				if(extension == 'js') {
					index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
					ada.config[index] = require(path+'/'+config_files[j]);
				}

			}

		}

		// Create getConfig helper
		global.getConfig = function(namespace, key) {

			return ada.config[namespace][key];

		};

	},

	synchronize : function() {

		var fs = require('fs');
		var prompt = require('prompt-sync').prompt;
		var writeConfig = false;

		var template = fs.readFileSync(process.env.PWD+'/.env.example');
		template = template.toString();
		
		require('util').log('Checking configuration...');

		var keys = {};
		/* jshint ignore:start */
		// Check if .env exists
		if(fs.existsSync(process.env.PWD+'/.env')) {

		    // Check if keys are synchronized
		    var current = fs.readFileSync(process.env.PWD+'/.env');
			current = current.toString();

			var template_keys = {};
			var template_lines = template.split("\n");
			for(var i=0; i<template_lines.length; i++) {
				var line = template_lines[i];
				if((line.trim().length)) {
					var exp = line.split('=', 2);
					template_keys[exp[0]] = exp[1];
				}
			}

			var current_keys = {};
			var current_lines = current.split("\n");
			for(var i=0; i<current_lines.length; i++) {
				var line = current_lines[i];
				if((line.trim().length)) {
					var exp = line.split('=', 2);
					current_keys[exp[0]] = exp[1];
				}
			}

			for(var index in template_keys) {
				if(typeof current_keys[index] === 'undefined') {
					writeConfig = true;
					console.log("\n"+index+':');
					var input = prompt({'value': template_keys[index].trim()});
					keys[index] = input.trim();	
				}
				else {
					keys[index] = current_keys[index];
				}
			}
		
		}
		else {
			
			// Create new configuration
			
			writeConfig = true;
			require('util').log('Creating new configuration');
			
			var lines = template.split("\n");
			for(var i=0; i<lines.length; i++) {
				var line = lines[i];
				if((line.trim().length)) {
					var exp = line.split('=', 2);
					keys[exp[0]] = exp[1];
				}
			}

			for(var index in keys) {
				console.log("\n"+index+':');
				var input = prompt({'value': keys[index].trim()});
				keys[index] = input.trim();	
			}

		}
		/* jshint ignore:end */

		// Write configuration
		if(writeConfig) {
			require('util').log("Writing configuration");
			var content = '';
			for(var index in keys) {
				content += index+'='+keys[index]+"\n";	
			}
			fs.writeFileSync(process.env.PWD+'/.env', content);	
		}
		
	}

};

module.exports = Config;