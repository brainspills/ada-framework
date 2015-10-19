/*
 * @package	Mongo
 * @module	Services/Mongo
 */
 var Mongo = {

 	db : null,
	client : null,
	url : '',
	ObjectID : null,

	init : function() {

		require('util').log('Mongo: Intializing MongoDB client...');

		Mongo.client = require('mongodb').MongoClient;
		Mongo.url = 'mongodb://';
		if(!isEmpty(getConfig('mongo', 'user')) && !isEmpty(getConfig('mongo', 'pass'))) {
			Mongo.url += getConfig('mongo', 'user')+':'+getConfig('mongo', 'pass')+'@';	
		}
		Mongo.url += getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+'/';
		Mongo.url += getConfig('mongo', 'dbname');
		
		Mongo.ObjectID = require('mongodb').ObjectID;
		
		Mongo.client.connect(Mongo.url, function(err, db) {	

			if(isEmpty(err)) {
				Mongo.db = db;
				require('util').log('Mongo: Connected to MongoDB server ['+getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+']');
				Mongo.buildIndeces();
			}
			else {
				require('util').log('[!] Mongo: Failed connecting to MongoDB server ['+getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+']');
				ada.server.close();
			}
			
		});

	},

	buildIndeces : function() {

		var fs = require('fs');

		// Load paths with models
		var paths = [];
		var path = '';
		paths.push(process.env.PWD+'/models');

		var packages = getConfig('app', 'packages');
		for(var i=0; i<packages.length; i++) {
			var package = packages[i];
			path = process.env.PWD+'/packages/'+package+'/models';
			if(fs.existsSync(path)) {
				paths.push(path);
			}
		}

		for(var j=0; j<paths.length; j++) {
			
			// Load model definitions
			var model_files = fs.readdirSync(paths[j]);
			
			for(i=0; i<model_files.length; i++) {

				path = model_files[i];
				var filename = path.replace(/^.*[\\\/]/, '');
				var extension = filename.split('.').pop();

				if(extension == 'js') {
				
					var Model = require(paths[j]+'/'+model_files[i]);

					if(Model) {
						
						var model = new Model();

						var collection = model.collectionName;
						var indeces = model.indeces;
						
						Mongo.db.collection(collection).dropIndexes();

						// Create identifier index
						if(model.identifier != 'id') {
							var fields = {};
							fields[model.identifier] = 1;
							Mongo.createIndex(collection, fields, {
								'unique': true, 
								'sparse': true,
								'name': model.identifier + '_identifier'
							});
						}
						
						// Create other indeces
						if(!isEmpty(indeces)) {
							for(var indexName in indeces) {
								indeces[indexName].options.name = indexName;
								Mongo.createIndex(collection, indeces[indexName].fields, indeces[indexName].options);
							}
						}

					}

				}
			
			}

		}

	},

	createIndex : function(collection, fields, options) {

		require('util').log('Mongo: Creating index in ' + collection + ': ' + options.name);

		Mongo.db.collection(collection).createIndex(fields, options, function(err, result) {
			if(isEmpty(err)) {
				require('util').log('Mongo: Index ' + result + ' created.');
			}
			else {
				require('util').log('Mongo: Index creation error.');
				require('util').log(err);
			}
			
		});

	}

};

module.exports = Mongo;