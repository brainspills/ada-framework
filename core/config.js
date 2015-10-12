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
		var config_files = fs.readdirSync(process.env.PWD+'/config');
		ada.config = {};
		
		for(var i=0; i<config_files.length; i++) {
			var index = config_files[i];
			index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
			ada.config[index] = require(process.env.PWD+'/config/'+config_files[i]);
		}

		var packages = fs.readdirSync(process.env.PWD+'/packages');

		/* jshint ignore:start */
		for(i=0; i<packages.length; i++) {
			
			var package = packages[i];

			if(fs.existsSync(process.env.PWD+'/packages/'+package+'/config')) {

				var configFiles = fs.readdirSync(process.env.PWD+'/packages/'+package+'/config');

				for(var j=0; j<configFiles.length; j++) {
			
					for(var k=0; k<configFiles.length; k++) {
						var index = configFiles[k];
						index = index.substring(index.lastIndexOf('/')+1, index.lastIndexOf('.'));
						ada.config[index] = require(process.env.PWD+'/packages/'+package+'/config/'+configFiles[k]);
					}
					
				}
			
			}

		}
		/* jshint ignore:end */
		
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
		
		console.log('Checking configuration...');

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
				if(!current_keys[index]) {
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
			console.log('Creating new configuration');
			
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
			console.log("\nWriting configuration");
			var content = '';
			for(var index in keys) {
				content += index+'='+keys[index]+"\n";	
			}
			fs.writeFileSync(process.env.PWD+'/.env', content);	
		}
		
	}

};

module.exports = Config;