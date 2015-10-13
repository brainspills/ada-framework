/*
 * @package	Auth
 * @module	Config/Auth
 */
module.exports = {
	'enable': process.env.AUTH_ENABLE,
	'login_path' : process.env.AUTH_LOGIN_PATH,
	'register_path' : process.env.AUTH_REGISTER_PATH,
	'model': process.env.AUTH_MODEL,
	'identity_key': process.env.AUTH_IDENTITY_KEY,
	'credential_key': process.env.AUTH_CREDENTIAL_KEY
};