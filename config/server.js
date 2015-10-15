/*
 * @package	Ada Framework
 * @module	Config/Server
 */

// Enable packages here
var packages = [
	'auth',
	'mongo',
	'reference',
	'blog'
];

module.exports = {
	'name': process.env.SERVER_NAME,
	'port': process.env.SERVER_PORT,
	'key': process.env.SERVER_KEY,
	'packages': packages
};