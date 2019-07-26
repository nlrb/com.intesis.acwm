'use strict';

const Homey = require('homey')
const AircoDevice = require('../airco/device.js')
const acwm = require('acwm-api')

class MHACWIFI1_Device extends AircoDevice {

	onInit() {
		let settings = this.getSettings()
		this.acwm = new acwm(settings.ip)
		this.acwm.login(settings.username, settings.password)
			.then(r => {
				console.log(r)
				this.interval = settings.interval
				super.onInit()
				this.updateAllValues()
				this.log('MHACWIFI1_Device has been inited')
			})
			.catch(err => console.error(err))
	}

}

module.exports = MHACWIFI1_Device;
