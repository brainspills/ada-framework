/*
 * @package	Ada Framework
 * @module	HTTP/Base Model
 */
module.exports = function Model() {

	self = this;
	self.documentError = {};

	self.isValidDocument = function(doc) {

		var constraints = {};

		for(var i=0; i<self.schema.length; i++) {			
			if(!isEmpty(self.schema[i].constraints)) {
				constraints[self.schema[i].key] = self.schema[i].constraints;
			}
		}

		var result = ada.services.validate.test(doc, constraints);

		//TODO: Model payload validation: Validate uniqueness
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
			ada.services.mongo.db.collection(self.collectionName).insertOne(doc, function(err, result) {	
				if(isEmpty(err)) {
					callback.call(this, result, err);
				}
				else {
					callback.call(this, err, err);
				}
			});
		}
		else {
			var err = new ada.restify.BadRequestError("Data validation failed");
			err.body.details = self.documentError;
			callback.call(this, err, err); 
		}

	};

	/*
	 * Update a single document by its ID
	 * Document must contain the ObjectID identified by the "id" key
	 */
	self.update = function(doc, callback) {

		var objId = '';

		try {
			objId = ada.services.mongo.ObjectID(doc.id);
		}
		catch(e) {
			callback.call(this, new ada.restify.ResourceNotFoundError('Document not found.'));
		}

		var payload = {};

		// Cleanup document payload (delete keys not defined in the schema)
		for(var i=0; i<self.schema.length; i++) {
			var index = self.schema[i].key;
			if(!isEmpty(doc[index])) {
				payload[index] = doc[index];
			}
		}

		//TODO: Model update: Validate payload

		ada.services.mongo.db.collection(self.collectionName).update({_id:objId}, payload, function(err, result) {
			if(isEmpty(err)) {
				callback.call(this, result, err);
			}
			else {
				callback.call(this, err, err);
			}
		});

	};

	/*
	 * Delete a single document by Object Id
	 */
	self.delete = function(objectId, callback) {

		var objId = '';

		try {
			objId = ada.services.mongo.ObjectID(objectId);
		}
		catch(e) {
			callback.call(this, new ada.restify.ResourceNotFoundError('Document not found.'));
		}

		ada.services.mongo.db.collection(self.collectionName).remove({_id:objId}, {justOne: true}, function(err, result) {
			if(isEmpty(err)) {
				callback.call(this, result, err);
			}
			else {
				callback.call(this, err, err);
			}
		});

		//TODO: Model delete: Cascade deletion

	};

	/*
	 * List all documents in page from a collection
	 * Page size determined from config: MONGO_PAGESIZE
	 */
	self.all = function(page, callback) {

		var cursor = ada.services.mongo.db.collection(self.collectionName).find()
			.skip(parseInt(getConfig('mongo', 'pagesize'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('mongo', 'pagesize')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Query a collection in a page based on a query
	 * Page size determined from config: MONGO_PAGESIZE
	 */
	self.find = function(page, query, callback) {

		var cursor = ada.services.mongo.db.collection(self.collectionName).find(query)
			.skip(parseInt(getConfig('mongo', 'pagesize'))*(parseInt(page)-1))
			.limit(parseInt(getConfig('mongo', 'pagesize')));

		self.hydrate(cursor, callback);

	};

	/*
	 * Retrieve a document from the collection by its Object Id
	 */
	self.id = function(objectId, callback) {

		var objId = '';

		try {
			objId = ada.services.mongo.ObjectID(objectId);
		}
		catch(e) {
			callback.call(this, {}, new ada.restify.ResourceNotFoundError('Document not found.'));
		}

		ada.services.mongo.db.collection(self.collectionName).findOne({_id:objId}, function(err, document) {
			self.hydrateOne(document, callback);
		});
		
	};

	/*
	 * Query a collection based on a query, expect one document
	 */
	self.findOne = function(query, callback) {

		ada.services.mongo.db.collection(self.collectionName).findOne(query, function(err, document) {
			
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
			    	callback.call(this, collection, total, getConfig('mongo', 'pagesize'));
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