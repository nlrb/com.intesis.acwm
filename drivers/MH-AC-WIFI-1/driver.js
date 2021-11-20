'use strict';

const Homey = require('homey');
const AircoDriver = require('../airco/driver.js')

class MHACWIFI1_Driver extends AircoDriver {

	onInit () {
		super.onInit();
		this.log('MHACWIFI1_Driver has been inited');
	}

}

module.exports = MHACWIFI1_Driver;
