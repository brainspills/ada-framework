/*
 * @package	Mongo
 * @module	Config/Mongo
 */
module.exports = {
	'host': process.env.MONGO_HOST,
	'port': process.env.MONGO_PORT,
	'dbname': process.env.MONGO_DBNAME,
	'pagesize': process.env.MONGO_PAGESIZE
};