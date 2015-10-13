/*
 * <Name> route definition
 * Auto-generated on <timestamp>
 */

module.exports = [

	{

		'route'  	: '/<names>',
		'method' 	: 'get',

		'response'	: {
			'type'	: 'collection'
		},
		
		'binding'	: {
			'model'	: ['<package>', '<name>']
		},

		'meta'		: {
			'desc'	: 'Retrieve <name> collection',
			'live'	: true	
		}

	},

	{

		'route'		: '/<name>/:id',
		'method'	: 'get',

		'response'	: {
			'type'	: 'document'
		},

		'binding'	: {
			'model'	: ['<package>', '<name>']
		},

		'meta'		: {
			'desc'	: 'Retrieve <name> document by its ID',	
			'live'	: true
		}

	},

	{

		'route'		: '/<name>',
		'method'	: 'post',

		'response'	: {
			'type'	: 'controller',
		},
		
		'binding'	: {
			'action'	 : 'create',
			'model'		 : ['<package>', '<name>']
		},

		'meta'		: {
			'desc'	: 'Create <name> document',
			'live'	: true	
		}

	},

	{

		'route'		: '/<name>/:id',
		'method'	: 'put',

		'response'	: {
			'type'	: 'controller',
		},
		
		'binding'	: {
			'action'	 : 'update',
			'model'		 : ['<package>', '<name>']
		},

		'meta'		: {
			'desc'	: 'Update <name> document by its ID',
			'live'	: true
		}

	},

	{

		'route'		: '/<name>/:id',
		'method'	: 'delete',

		'response'	: {
			'type'	: 'controller',
		},
		
		'binding'	: {
			'action'	 : 'delete',
			'model'		 : ['<package>', '<name>']
		},

		'meta'		: {
			'desc'	: 'Delete <name> document by its ID',
			'live'	: true
		}

	}

];