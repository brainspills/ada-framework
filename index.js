"use strict";

/*
 * @package Ada Framework
 */
var Ada = require('./core/ada.js');

/*
 * Instantiate app in the global namespace
 */
global.ada = new Ada();

/*
 * Start service
 */
ada.serve();