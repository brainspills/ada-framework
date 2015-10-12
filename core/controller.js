/*
 * @package	Ada Framework
 * @module	HTTP/Base Controller
 */
module.exports = function Controller(request, response) {

	var self = this;

	self.request = request;
	self.response = response;

	self._construct = function(binding) {

		if(!isEmpty(binding.model)) {
			self.model = loadModel(binding.model);
		}

	};

	self.create = function () {

		self.model.create(self.request.params, function(result, err){

			//TODO: Document create: Standardize response
		
			self.response.send(result);	
		
		});
		
	};

	self.update = function () {

		self.model.update(self.request.params, function(result, err) {

			//TODO: Document update: Standardize response

			self.response.send(result);	

		});

	};

	self.delete = function() {

		self.model.delete(self.request.params.id, function(result, err) {

			//TODO: Document delete: Standardize response

			self.response.send(result);	

		});

	};

};