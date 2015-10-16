/*
 * @package	Ada Framework
 * @module	Services/Hal
 */


var Hal = {

	init : function() {

		require('util').log('HAL: Intializing HAL formatter service...');

	},

	collection : function(collection, model, page, total, pagesize, pre_path) {

		if(isEmpty(pre_path)) pre_path = '';
		var base = pre_path+model.collectionURI;

		page = parseInt(page);
		total = parseInt(total);
		pagesize = parseInt(pagesize);
		pages = Math.ceil(total/pagesize);

		var page_url = '';
		if(page != 1) {
			page_url = '?page='+page;
		}

		var hal = require('nor-hal');
		var resource = new hal.Resource({
			'count': collection.length,
			'total': total 
		}, base+page_url);

		// Create Pager (_links)
		if(pages > 1 && page != 1) {
        	resource.link('first', base);
        }
        if(page > 1 && ((page-1) > 1)) {
        	if((page-1) > 1) {
        		resource.link('prev', base+'?page='+(page-1));
        	}
        	else {
        		resource.link('prev', base);
        	}
        }
        if((page+1) <= pages) {
        	resource.link('next', base+'?page='+(page+1));
        }
        if(page != pages && pages > 1) {
        	resource.link('last', base+'?page='+pages);
        }
		
		for(var i=0; i<collection.length; i++) {
			resource.embed(model.collectionURI, Hal.document(collection[i], model));
		}

		return resource;

	},

	document : function(document, model, pre_path) {

		if(isEmpty(pre_path)) pre_path = '';
		var base = pre_path+model.documentURI;
		
		var keys = {};
        keys.id = document._id;
		delete document._id;

		for(var key in document) {
			keys[key] = document[key];
		}

		var hal = require('nor-hal');
		var resource = new hal.Resource(keys, base+'/'+keys[model.identifier]);

		return resource;

	}

};

module.exports = Hal;