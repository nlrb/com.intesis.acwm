'use strict'

const Homey = require('homey')
const acwm = require('acwm-api')

class AircoDriver extends Homey.Driver {

  onInit () {
    this._actionTemperature = new Homey.FlowCardAction('temperature');
    this.actionTemperature();
    this._actionThermostatMode = new Homey.FlowCardAction('thermostat_mode');
    this.actionThermostatMode();
    this._actionFanRate = new Homey.FlowCardAction('fanrate');
    this.actionFanRate();
    this._actionVaneUpDownPosition = new Homey.FlowCardAction('vane_updown_position');
    this.actionVaneUpDownPosition();


  }
  actionTemperature () {
    this._actionTemperature
      .registerRunListener((args, state) => {
        const device = args.aircoDevice;
        return new Promise((resolve, reject) => {
          device.onSetpoint(args.degrees).then(() => {
            resolve(true);
          }, (_error) => {
            reject(false)
          });
        });
      })
      .register();
  }
  actionThermostatMode () {
    this._actionThermostatMode
      .registerRunListener((args, state) => {
        const device = args.aircoDevice;
        return new Promise((resolve, reject) => {
          device.onThermostatMode(args.mode).then(() => {
            resolve(true);
          }, (_error) => {
            reject(false)
          });
        });
      })
      .register();
  }

  actionFanRate () {
    this._actionFanRate
      .registerRunListener((args, state) => {
        const device = args.aircoDevice;
        return new Promise((resolve, reject) => {
          device.onFanRate(args.rate).then(() => {
            resolve(true);
          }, (_error) => {
            reject(false)
          });
        });
      })
      .register();
  }


  actionVaneUpDownPosition () {
    this._actionVaneUpDownPosition
      .registerRunListener((args, state) => {
        const device = args.aircoDevice;
        return new Promise((resolve, reject) => {
          device.onVaneUpDownDirection(args.position).then(() => {
            resolve(true);
          }, (_error) => {
            reject(false)
          });
        });
      })
      .register();
  }
  onPair (socket) {
    this.log('Pairing started')

    socket.emit('authorized')

    socket.on('check', async (data, callback) => {
      this.log('Checking', data)
      try {
        let airco = new acwm(data.ip)
        let result = await airco.getInfo()
        let login = await airco.login(data.username, data.password)

        let device = {
          name: result.ownSSID,
          data: { id: result.sn },
          settings: {
            ip: data.ip,
            username: data.username,
            password: data.password,
            interval: 10,
            model: result.deviceModel,
            serial: result.sn
          }
        }
        callback(null, device)
      } catch (err) {
        this.error(err.error || err)
        callback(err.error || err, null)
      }
    })
  }

}

module.exports = AircoDriver
