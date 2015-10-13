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

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.send(201, {"message":"Resource created succesfully."});
			}
		
		});
		
	};

	self.update = function () {

		self.model.update(self.request.params, function(result, err) {

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.send(200, {"message":"Resource updated successfully."});
			}

		});

	};

	self.delete = function() {

		self.model.delete(self.request.params.id, function(result, err) {

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.send(200, {"message":"Resource deleted successfully."});
			}

		});

	};

};