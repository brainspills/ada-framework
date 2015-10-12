"use strict";

var FindFiles = require("node-find-files");

var finder = new FindFiles({
    
    rootFolder : './',
    
    filterFunction : function (path) {
    	
    	var segments = path.split('/');
    	
    	if(segments[0] != 'node_modules' && segments[0] != '.git') {
    		
    		var filename = path.replace(/^.*[\\\/]/, '');
    		var extension = filename.split('.').pop();

    		if(extension == 'js') {
    			return true;
    		}
    	}

        return false;
    
    }

});

finder.on('match', function(path) {

	var fs = require('fs');
	var filename = './'+path;

	if(filename != './tools/todo.js') {

		fs.readFile(filename, function (err, data) {
		
			if (err) {
				throw err;
			}

			var content = data.toString();

			var lines = content.split("\n");

			for(var i=0; i<lines.length; i++) {
				
				var line = lines[i];
				var row = line.indexOf('//TODO:');

				if(row != -1) {

					var number = i+1;
					var description = line.substring(row).replace('//TODO:', '').trim();
						
					console.log('');
					console.log(description);
					console.log(filename+' - line '+number);
					console.log('');

				}

			}

		});

	}

})

finder.startSearch();