/*
 * @package	Ada Framework
 * @module	Services/Mongo
 */
 var Mongo = {

 	db : null,
	client : null,
	url : '',
	ObjectID : null,

	init : function() {

		console.log('Mongo: Intializing MongoDB client...');

		Mongo.client = require('mongodb').MongoClient;
		Mongo.url = 'mongodb://'+getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+'/'+getConfig('mongo', 'dbname');
		Mongo.ObjectID = require('mongodb').ObjectID;
		
		Mongo.client.connect(Mongo.url, function(err, db) {	

			if(isEmpty(err)) {
				
				Mongo.db = db;
				console.log('Mongo: Connected to MongoDB server ['+getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+']');

				// Build indeces
				var fs = require('fs');
				var model_files = fs.readdirSync(process.env.PWD+'/models');

				//TODO: Mongo Indexing: Load package models
				
				for(var i=0; i<model_files.length; i++) {

					var path = model_files[i];
					var filename = path.replace(/^.*[\\\/]/, '');
					var extension = filename.split('.').pop();

					if(extension == 'js') {
					
						var Model = require('./../models/'+model_files[i]);
						var model = new Model();

						var collection = model.collectionName;
						var indeces = model.indeces;
						
						/*jshint -W051 */ 
						delete Model;
						delete model;
						/*jshint +W051 */ 

						Mongo.db.collection(collection).dropIndexes();
						
						if(!isEmpty(indeces)) {
		
							for(var indexName in indeces) {
								console.log('Mongo: Creating index in ' + collection + ': ' + indexName);
								indeces[indexName].options.name = indexName;
								/*jshint -W083 */
								Mongo.db.collection(collection).createIndex(indeces[indexName].fields, indeces[indexName].options, function(err, result) {
									if(isEmpty(err)) {
										console.log('Mongo: Index ' + result + ' created.');
									}
									else {
										console.log('Mongo: Index creation error.');
										console.log(err);
									}
									
								});
								/*jshint +W083 */
							}

						}

					}
				
				}

			}
			else {
				console.log('[!] Mongo: Failed connecting to MongoDB server ['+getConfig('mongo', 'host')+':'+getConfig('mongo', 'port')+']');
				ada.server.close();
			}
			
		});

	}

};

module.exports = Mongo;