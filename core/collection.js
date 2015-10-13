/*
 * @package	Ada Framework
 * @module	HTTP/Base Collection
 */
module.exports = function Collection(request, response, model) {

	var self = this;

	self.request = request;
	self.response = response;

	self.model = loadModel(model);

	self.page = isEmpty(self.request.params.page) ? 1 : self.request.params.page;
	self.query = {};

	//TODO: Support partial keys (fields parameter)

	for(var index in self.request.params) {
		if(index != 'page') {
			self.query[index] = self.request.params[index];
		}
	}

	var callback = function(collection, total, pagesize) {
	    self.response.send(ada.services.hal.collection(collection, self.model, self.page, total, pagesize));
	};

	if(isEmpty(self.query)) {
		self.model.all(self.page, callback);
	}
	else {
		self.model.find(self.page, self.query, callback);
	}

};