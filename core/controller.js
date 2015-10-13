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

		self.model.create(self.request.params, function(doc, result, err){

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.setHeader('Location', '/'+self.model.documentURI+'/'+doc.id);
				var body = {};
				body.message = 'Resource successfully created';
				body[self.model.documentURI] = doc;
				self.response.send(201, body);
			}
		
		});
		
	};

	self.update = function () {

		self.model.update(self.request.params, function(result, err) {

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.setHeader('Location', '/'+self.model.documentURI+'/'+self.request.params.id);
				self.response.send(200, {
					'message': 'Resource successfully updated.'
				});
			}

		});

	};

	self.delete = function() {

		self.model.delete(self.request.params.id, function(result, err) {

			if(!isEmpty(err)) {
				self.response.send(err);
			}
			else {
				self.response.send(200, {
					'message': 'Resource successfully deleted.'
				});
			}

		});

	};

};