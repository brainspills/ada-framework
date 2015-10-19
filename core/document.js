/*
 * @package	Ada Framework
 * @module	HTTP/Base Document
 */
module.exports = function Document(request, response, model, embed) {

	var self = this;

	self.request = request;
	self.response = response;

	self.model = loadModel(model);
	self.embed = embed;

	//TODO: Support partial keys (fields parameter)
	
	self.model.id(self.request.params.id, function(result, err) {

		if(isEmpty(err)) {

			var document = result;

			if(!isEmpty(self.embed)) {
				
				var embed_settings = self.model.embed[self.embed];
				var embed = loadModel(embed_settings.model);
				var page = isEmpty(self.request.params.page) ? 1 : self.request.params.page;

				var query = {};
				query[embed_settings.key] = self.request.params.id;

				for(var index in self.request.params) {
					if(index != 'page' && index != 'id') {
						query[index] = self.request.params[index];
					}
				}

				embed.find(page, query, function(collection, total, pagesize) {

					var doc_hal = ada.services.hal.document(document, self.model);
				   	var emb_hal = ada.services.hal.collection(collection, embed, page, total, pagesize, self.model.documentURI+'/'+self.request.params.id+'/');

				   	var out = doc_hal._data;
				   	out._links = emb_hal._data._links;
				   	out.count = emb_hal._data.count;
				   	out.total = emb_hal._data.total;
				   	out._embedded = emb_hal._data._embedded;

				   	self.response.setHeader('Last-Modified', toHttpDateTime(document.updated_at));
				   	self.response.send(out);
				
				});
			
			}
			else {

				self.response.setHeader('Last-Modified', toHttpDateTime(document.updated_at));
				self.response.send(ada.services.hal.document(document, self.model));

			}

		}
		else {

			self.response.send(err);

		}

	});

};