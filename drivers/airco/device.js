'use strict'

const Homey = require('homey')
const acwm = require('acwm-api')

class AircoDevice extends Homey.Device {

  onInit () {
    // Common capability listeners
    const capabilityListeners = {
      onoff: this.onPowerOnoff.bind(this),
      thermostat_mode_mh: this.onThermostatMode.bind(this),
      fan_rate_mh: this.onFanRate.bind(this),
      vane_updown_position_mh: this.onVaneUpDownDirection.bind(this),
      target_temperature: this.onSetpoint.bind(this)
    }

    // Only watch out for state changes of capabilities that this device supports
    this.getCapabilities().forEach(capability => {
      // Register common capability listeners that this device supports
      if (capabilityListeners[capability] !== undefined) {
        this.registerCapabilityListener(capability, capabilityListeners[capability])
      }
    })

    // Set up Polling
    this.setPollTimer(this.interval)

    this.log('AircoDevice has been inited')
  }

  // Check settings and update e.g. ip, timer when needed
  async onSettings (oldSettings, newSettings, changedKeys, callback) {
    this.log(changedKeys)
    let error
    if (changedKeys.includes('ip')) {
      // Check if IP address is validates
      let airco = new acwm(newSettings.ip)
      try {
        let result = await airco.getInfo()
        if (result.sn === this.getData().id) {
          this.acwm = airco
        } else {
          error = 'Serial number is different'
        }
      } catch (err) {
        error = err
      }
    }
    if (changedKeys.includes('username') || changedKeys.includes('password')) {
      let username = newSettings.username || oldSettings.username
      let password = newSettings.password || oldSettings.password
      try {
        await this.acwm.login(username, password)
      } catch (err) {
        error = (err.error !== undefined ? err.error.message : err)
      }
    }
    if (changedKeys.includes('interval')) {
      clearInterval(this.pollTimer)
      this.setPollTimer(newSettings.interval)
    }
    callback((error == undefined ? null : error), (error == undefined ? newSettings : null))
  }

  // The Device has requested a state change (turned on or off)
  onPowerOnoff (value) {
    this.log('onPowerOnoff', value)
    return this.acwm.setDataPointValue(1, (value ? 1 : 0))
  }

  onThermostatMode (value) {
    this.log('onThermostatMode', value)
    return this.acwm.setDataPointValue(2, Number(value))
  }

  onFanRate (value) {
    this.log('onFanRate', value)
    return this.acwm.setDataPointValue(4, Number(value))
  }

  onVaneUpDownDirection (value) {
    this.log('onVaneUpDownDirection', value)
    return this.acwm.setDataPointValue(5, Number(value))
  }

  onSetpoint (value) {
    this.log('onSetpoint', value)
    return this.acwm.setDataPointValue(9, value * 10)
  }

  updateAllValues () {
    this.acwm.getDataPointValue()
      .then(result => {
        result.forEach(x => {
          let update;
          if (x.uid === 1) {
            update = { item: 'onoff', value: x.value == 1 };
          } else if (x.uid === 2) {
            update = { item: 'thermostat_mode_mh', value: x.value.toString() };
          } else if (x.uid === 4) {
            update = { item: 'fan_rate_mh', value: x.value.toString() };
          } else if (x.uid === 5) {
            update = { item: 'vane_updown_position_mh', value: x.value.toString() };
          } else if (x.uid === 9) {
            update = { item: 'target_temperature', value: x.value / 10 };
          } else if (x.uid === 10) {
            update = { item: 'measure_temperature.inside', value: x.value / 10 };
          } else if (x.uid === 37) {
            update = { item: 'measure_temperature.outside', value: x.value / 10 };
          }
          if (update) {
            this.setCapabilityValue(update.item, update.value)
              .catch(err => this.error('Error:', update, err.message));
          }
        })
      })
      .catch(err => this.error(err))
  }

  // Set up timer to poll status of the device
  setPollTimer (interval) {
    this.pollTimer = setInterval(async () => {
      this.updateAllValues()
    }, (interval || 10) * 1000)
  }
}

module.exports = AircoDevice
