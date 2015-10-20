/*
 * @package	Ada Framework
 * @module	HTTP/Base Model
 */
module.exports = function Model() {

	self = this;
	self.identifier = 'id';
	self.mongo = ada.services.mongo;
	self.database = self.mongo.db;

	/*
	 * Create a single document in the collection
	 */
	self.create = function(doc, callback) {

		doc = self.reduceKeys(doc);
		doc = self.ensureTypes(doc);
		
		self.isValidDocument(doc, function(valid, err) {

			if(valid) {

	 			doc._id = new self.mongo.ObjectID();
	 			
	 			// Create timestamps (UTC)
	 			var stamp = getUTCStamp();
	 			doc.created_at = stamp;
	 			doc.updated_at = stamp;

				self.database.collection(self.collectionName).insertOne(doc, function(err, result) {	
					
					if(isEmpty(err)) {
						doc.id = doc._id;
						delete doc._id;
						callback.call(this, self.removeHidden(doc), result, err);
						return;
					}
					else {
						callback.call(this, null, err, err);
						return;
					}

				});

			}
			else {
				
				return;
			
			}

		});

	};

	/*
	 * Update a single document by its identifer
	 */
	self.update = function(id, doc, callback) {

		doc = self.reduceKeys(doc);
		doc = self.ensureTypes(doc);

		// Resolve identifier
		var query = {};
		var identifier = self.identifier;
		if(self.identifier == 'id') {
			try {
				identifier = '_id';
				query = {_id:self.mongo.ObjectID(id)};
			}
			catch(e) {
				callback.call(this, 
					new ada.restify.ResourceNotFoundError('Document not found.'),
					new ada.restify.ResourceNotFoundError('Document not found.')
				);
				return;
			}
		}
		else {
			query[self.identifier] = id;
		}

		if(parseInt(getConfig('collection','readonly_identifier')) == 1) {
			// Remove identifier from the doc - for readonly resource identifier
			delete doc[identifier];	
		}

		// Validate doc
		self.isValidDocument(doc, id, function(valid, err) {

			if(valid) {

				// Insert updated_at timestamp (UTC)
				doc.updated_at = getUTCStamp();
				
				self.database.collection(self.collectionName).update(query, {$set: doc}, function(err, result) {
				
					if(isEmpty(err)) {
						
						if(result.result.nModified === 0) {
							callback.call(this, 
								new ada.restify.ResourceNotFoundError('Document not found.'), 
								new ada.restify.ResourceNotFoundError('Document not found.')
							);
							return;
						}

						callback.call(this, result, err);
						return;

					}
					else {
						callback.call(this, err, err);
						return;
					}
				
				});
	 			
			}
			else {
				
				callback.call(this, err, err); 
				return;
			
			}

		});

		

	};

	/*
	 * Delete a single document by its identifier
	 */
	self.delete = function(id, callback) {

		// Resolve identifier
		var query = {};
		if(self.identifier == 'id') {
			try {
				query = {_id:self.mongo.ObjectID(id)};
			}
			catch(e) {
				callback.call(this, 
					new ada.restify.ResourceNotFoundError('Document not found.'),
					new ada.restify.ResourceNotFoundError('Document not found.')
				);
				return;
			}
		}
		else {
			query[self.identifier] = id;
		}

		self.database.collection(self.collectionName).remove(query, {justOne: true}, function(err, result) {
			
			if(isEmpty(err)) {

				if(result.result.n === 0) {
					callback.call(this, 
						new ada.restify.ResourceNotFoundError('Document not found.'), 
						new ada.restify.ResourceNotFoundError('Document not found.')
					);
					return;
				}

				callback.call(this, result, err);
				return;
				
				//TODO: Model delete: Cascade deletion

			}
			else {
				callback.call(this, err, err);
				return;
			}
		
		});

	};

	/*
	 * List all documents in page from a collection
	 */
	self.all = function(page, callback) {

		var cursor = self.database.collection(self.collectionName).find()
			.skip(parseInt(getConfig('collection', 'page_size'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('collection', 'page_size')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Query a collection in a page based on a query
	 */
	self.find = function(page, query, callback) {

		var cursor = self.database.collection(self.collectionName).find(query)
			.skip(parseInt(getConfig('collection', 'page_size'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('collection', 'page_size')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Retrieve a document from the collection by its identifier
	 */
	self.id = function(id, callback) {

		// Resolve identifier
		var query = {};
		if(self.identifier == 'id') {
			try {
				query = {_id:self.mongo.ObjectID(id)};
			}
			catch(e) {
				callback.call(this, 
					new ada.restify.ResourceNotFoundError('Document not found.'),
					new ada.restify.ResourceNotFoundError('Document not found.')
				);
				return;
			}
		}
		else {
			query[self.identifier] = id;
		}

		self.database.collection(self.collectionName).findOne(query, function(err, document) {
			self.hydrateOne(document, callback);
		});
		
	};

	/*
	 * Query a collection based on a query, expect one document
	 */
	self.findOne = function(query, callback) {

		self.database.collection(self.collectionName).findOne(query, function(err, document) {
			self.hydrateOne(document, callback);				
		});

	};

	/*
	 * Transform cursor into an array of documents
	 */
	self.hydrate = function(cursor, callback) {

		var collection = [];

		cursor.count(false, function(err, total) {
			cursor.each(function(err, doc) {
			    if(doc) {
			    	collection.push(self.removeHidden(doc));
			    }
			    else {
			    	callback.call(this, collection, total, getConfig('collection', 'page_size'));
			    	return;
			    }
		    });
		});
		
	};

	/*
	 * Transform cursor into a document
	 */
	self.hydrateOne = function(document, callback) {

		if(isEmpty(document)) {
			callback.call(this, 
				new ada.restify.ResourceNotFoundError('Document not found.'), 
				new ada.restify.ResourceNotFoundError('Document not found.')
			);
		}
		else {
			callback.call(this, self.removeHidden(document));	
			return;
		}

	};

	/*
	 * Test if a document has a valid data structure as defined in the schema
	 */
	self.isValidDocument = function(doc, ident, cb) {

		var operation = 'update';
		if(typeof cb === 'undefined') {
			cb = ident;
			operation = 'create';
		}

		var constraints = {};

		for(var i=0; i<self.schema.length; i++) {			
			if(!isEmpty(self.schema[i].constraints)) {
				
				var rules = self.schema[i].constraints;

				if(operation == 'create') {
					constraints[self.schema[i].key] = rules;	
				}
				if(operation == 'update') {
					if(typeof doc[self.schema[i].key] !== 'undefined') {
					 	constraints[self.schema[i].key] = rules;
					}
				}
			
			}
		}

		var result = ada.services.validate.test(doc, constraints);

		if(isEmpty(result)) {
		
			//TODO: Model payload validation: Validate presence of related document in a collection (references)

			// Validate uniqueness (return 409 as error)
			var keys = self.getUniqueKeys();
			var query = {$or:[]};

			for(i=0; i<keys.length; i++) {
				var criteria = {};
				criteria[keys[i]] = doc[keys[i]];
				query.$or.push(criteria);
			}

			self.database.collection(self.collectionName).findOne(query, function(err, document) {
				
				if(isEmpty(document)) {
					// Document has no record yet
					cb.call(this, true, null);	
					return;
				}
				else {

					var identifier = (self.identifier == 'id') ? '_id' : self.identifier;

					if(document[identifier] == ident) {
						// Resource fetched is the same as the document in question
						cb.call(this, true, null);
						return;
					}
					else {

						err = new ada.restify.ConflictError('Data validation failed');
						var details = {};
						for(i=0; i<keys.length; i++) {
							if(doc[keys[i]] == document[keys[i]]) {
								details[keys[i]] = [keys[i] + ' must be unique'];
							}
						}
						err.body.details = details;
						cb.call(this, false, err);
						return;

					}

				}
								
			});
		
		}
		else {
			var err = new ada.restify.BadRequestError('Data validation failed');
			err.body.details = result;
			cb.call(this, false, err);
			return;
		}

	};

	/*
	 * Return a list of keys that are indexed as unique
	 */
	self.getUniqueKeys = function() {

		var unique = [];

		if(self.identifier != 'id') {
			unique.push(self.identifier);
		}

		if(!isEmpty(self.indeces)) {
			for(var index in self.indeces) {
				if(self.indeces[index].options.unique == 1) {
					for(var key in self.indeces[index].fields) {
						if(self.indeces[index].fields[key] == 1) {
							unique.push(key);
						}
					}
				}
			}
		}
		
		return unique;

	};

	/*
	 * Cast data types as defined in the schema
	 */
	self.ensureTypes = function(doc) {

		var constraints = {};

		for(var i=0; i<self.schema.length; i++) {			
			if(!isEmpty(self.schema[i].constraints)) {
				constraints[self.schema[i].key] = self.schema[i].constraints;
			}
		}

		for(var key in constraints) {

			if(typeof doc[key] !== 'undefined') {
			
				var constraint = constraints[key];

				// Ensure integer type
				if(
					typeof constraint.numericality !== 'undefined' && 
				  	typeof constraint.numericality.onlyInteger !== 'undefined' &&
				  	constraint.numericality.onlyInteger) {

					doc[key] = parseInt(doc[key]);
				
				}
			
			}

		}

		return doc;

	};

	/*
	 * Delte keys from a document that are not defined in the schema
	 */
	self.reduceKeys = function(doc) {

		var payload = {};
		for(var i=0; i<self.schema.length; i++) {
			var index = self.schema[i].key;	
			if(typeof doc[index] !== 'undefined') {
				payload[index] = doc[index];
			}
		}

		return payload;

	};

	/*
	 * Delete keys from a document that is configured to be hidden
	 */
	self.removeHidden = function(document) {

		var removeKeys = [];
		
		// Remove _id if model has a custom indentifier
		if(self.identifier != 'id') {
			removeKeys.push('_id');
			removeKeys.push('id');
		}

		for(var i=0; i<self.schema.length; i++) {
			if(self.schema[i].meta.hidden) {
				removeKeys.push(self.schema[i].key);
			}
		}

		for(i=0; i<removeKeys.length; i++) {
			delete document[removeKeys[i]];
		}

		return document;

	};

};