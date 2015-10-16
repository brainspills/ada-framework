/*
 * @package	Ada Framework
 * @module	Config/App
 */

// Enable packages here
var packages = [
	'auth',
	'mongo',
	'reference',
	'blog'
];

module.exports = {
	'key': process.env.APP_KEY,
	'debug': process.env.APP_DEBUG,
	'packages': packages
};