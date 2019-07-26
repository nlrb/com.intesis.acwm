'use strict'

const Homey = require('homey')
const acwm = require('acwm-api')

class AircoDriver extends Homey.Driver {

	onInit() {
  }

  onPair(socket) {
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
      } catch(err) {
        this.error(err.error || err)
        callback(err.error || err, null)
      }
    })
  }

}

module.exports = AircoDriver
