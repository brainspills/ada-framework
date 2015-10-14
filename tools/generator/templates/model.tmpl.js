/*
 * <Name> model definition
 * Auto-generated on <timestamp>
 */

var Model = extend('model');

function <Name>() {

	var self = this;

	Model.call(this);

	self.collectionURI = '<names>';
	self.documentURI = '<name>'; 

	self.collectionName = '<name>';

	/** Schema information **/
	self.schema = [
<keys>
	];

	/** Set identifier key (primary) **/
	// self.identifier = 'key';

	/** Embeddable collections **/
	/*
	self.embed = {
		'collection' : {
			'model'	: 'model',
			'key'	: 'local_id'
		}
	};
	*/

	/** Indexing information **/
	/*
	self.indeces = {
		'local_id_foreign' : {
			'fields' 	: {
				'local_id' : 1
			},
			'options'	: {
				'sparse': true
			}
		},
		'key_unique' : {
			'fields' 	: {
				'key'	: 1
			},
			'options'	: {
				'unique': true,
				'sparse': true
			}
		}
	};
	*/

}

<Name>.prototype = Object.create(Model.prototype);
<Name>.prototype.constructor = Model;

module.exports = <Name>;