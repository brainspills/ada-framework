"use strict";

var type = process.argv[2];
var name = process.argv[3];
var args = process.argv[4];
var pckg = process.argv[5];

var templates = [];

switch(type) {
	case 'controller':
		templates = ['controller'];
	break;
	case 'model':
		templates = ['model'];
	break;
	case 'resource':
		templates = ['model', 'route-with-model'];
	break;
}

for(var i=0; i<templates.length; i++) {

	var Writer = require(process.env.PWD+'/tools/generator/writers/'+templates[i]+'.js');
	var writer = new Writer(name, args, pckg);
	writer.content = writer.process();
	writer.write();

}