/*
 * @package	Ada Framework
 * @module	HTTP/Base Model
 */
module.exports = function Model() {

	self = this;
	self.identifier = 'id';
	self.documentError = {};
	self.database = ada.services.mongo.db;

	self.isValidDocument = function(doc) {

		var constraints = {};

		for(var i=0; i<self.schema.length; i++) {			
			if(!isEmpty(self.schema[i].constraints)) {
				constraints[self.schema[i].key] = self.schema[i].constraints;
			}
		}

		var result = ada.services.validate.test(doc, constraints);

		//TODO: Model payload validation: Validate uniqueness (return 409 as error)
		//TODO: Model payload validation: Validate presence of related document in a collection (references)
		//TODO: Model payload validation: Ensure datatypes

		if(isEmpty(result)) {
			return true;
		}
		else {
			self.documentError = result;
			return false;
		}

	};

	/*
	 * Create a single document in the collection
	 */
	self.create = function(doc, callback) {

		if(self.isValidDocument(doc)) {

 			doc._id = new ada.services.mongo.ObjectID();
 			
 			//TODO: Insert doc.created_at
 			//TODO: Insert doc.updated_at

			self.database.collection(self.collectionName).insertOne(doc, function(err, result) {	
				
				if(isEmpty(err)) {
					doc.id = doc._id;
					delete doc._id;
					callback.call(this, doc, result, err);
				}
				else {
					callback.call(this, null, err, err);
				}

			});

		}
		else {
			
			var err = new ada.restify.BadRequestError('Data validation failed');
			err.body.details = self.documentError;
			callback.call(this, err, err); 
		
		}

	};

	/*
	 * Update a single document by its identifer
	 * Document must contain the identifier key and value
	 */
	self.update = function(doc, callback) {

		// Resolve identifier
		var query = {};
		if(self.identifier == 'id') {
			var objId = '';
			try {
				objId = ada.services.mongo.ObjectID(doc.id);
				{_id:objId}
			}
			catch(e) {
				callback.call(this, new ada.restify.ResourceNotFoundError('Document not found.'));
			}
		}
		else {
			query[self.identifier] = doc[self.identifier];
		}

		// Cleanup document payload (delete keys not defined in the schema)
		var payload = {};
		for(var i=0; i<self.schema.length; i++) {
			var index = self.schema[i].key;
			if(!isEmpty(doc[index])) {
				payload[index] = doc[index];
			}
		}

		//TODO: Model update: Validate payload
		//TODO: Insert payload.updated_at

		self.database.collection(self.collectionName).update(query, payload, function(err, result) {
			if(isEmpty(err)) {
				callback.call(this, result, err);
			}
			else {
				callback.call(this, err, err);
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
			var objId = '';
			try {
				objId = ada.services.mongo.ObjectID(id);
				{_id:objId}
			}
			catch(e) {
				callback.call(this, new ada.restify.ResourceNotFoundError('Document not found.'));
			}
		}
		else {
			query[self.identifier] = id;
		}

		self.database.collection(self.collectionName).remove(query, {justOne: true}, function(err, result) {
			
			if(isEmpty(err)) {

				callback.call(this, result, err);
				
				//TODO: Model delete: Cascade deletion

			}
			else {
				callback.call(this, err, err);
			}
		
		});

	};

	/*
	 * List all documents in page from a collection
	 * Page size determined from config: MONGO_PAGESIZE
	 */
	self.all = function(page, callback) {

		var cursor = self.database.collection(self.collectionName).find()
			.skip(parseInt(getConfig('collection', 'pagesize'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('collection', 'pagesize')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Query a collection in a page based on a query
	 * Page size determined from config: MONGO_PAGESIZE
	 */
	self.find = function(page, query, callback) {

		var cursor = self.database.collection(self.collectionName).find(query)
			.skip(parseInt(getConfig('collection', 'pagesize'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('collection', 'pagesize')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Retrieve a document from the collection by its identifier
	 */
	self.id = function(id, callback) {

		// Resolve identifier
		var query = {};
		if(self.identifier == 'id') {
			var objId = '';
			try {
				objId = ada.services.mongo.ObjectID(id);
				{_id:objId}
			}
			catch(e) {
				callback.call(this, new ada.restify.ResourceNotFoundError('Document not found.'));
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
			    	callback.call(this, collection, total, getConfig('collection', 'pagesize'));
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
		}

	};

	self.removeHidden = function(document) {

		var removeKeys = [];
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