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

		var hal = {};
		page = parseInt(page);
		total = parseInt(total);
		pagesize = parseInt(pagesize);
		pages = parseInt(total/pagesize);

		// Build _links
		var page_url = '';
		if(page != 1) {
			page_url = '?page='+page;
		}

		var links = {
			'self': {
	            'href': base+page_url
	        }
        };

        if(pages > 1) {
        	links.first = {
	    		'href': base
	    	};
        }

        if(page > 1) {
        	if((page-1) > 1) {
        		links.prev = {
	        		'href': base+'?page='+(page-1)
	        	};	
        	}
        	else {
        		links.prev = {
	        		'href': base
	        	};
        	}
        }

        if((page+1) <= pages) {
        	links.next = {
        		'href': base+'?page='+(page+1)
        	};
        }

        if(page != pages && pages > 1) {
        	links.last = {
	    		'href': base+'?page='+pages
	    	};	
        }
       
        hal._links = links;

        // Build count
        hal.count = collection.length;
        hal.total = total;

        // Build _embedded 
		var embedded = {};
		embedded[model.collectionURI] = [];

		for(var i=0; i<collection.length; i++) {
			embedded[model.collectionURI].push(Hal.document(collection[i], model));
		}
		
		hal._embedded = embedded;

		return hal;

	},

	document : function(document, model, pre_path) {

		if(isEmpty(pre_path)) pre_path = '';
		var base = pre_path+model.documentURI;
		
		var hal = {};

		var identifier = (model.identifier == 'id') ? '_id' : model.identifier;

		// Build _links
		var links = {
			'self': {
	            'href': base+'/'+document[identifier]
	        }
        };

        hal._links = links;

        // Build id
        hal.id = document._id;

        // Build document
		delete document._id;

		for(var key in document) {
			hal[key] = document[key];
		}

		return hal;

	}

};

module.exports = Hal;