'use strict'

const acwm = require('./index.js')

var airco = new acwm('192.168.1.219')

// Get generic info
airco.getInfo()
  .then(info => console.log(info))
  .catch(error => console.error(error))

// Log in
airco.login(null, 'admin')
  .then(async result => {
    if (result.data) {
      try {
        console.log(await airco.init())
        console.log(await airco.getCurrentConfig())
        console.log(await airco.logout())
        console.log(await airco.getAvailableDataPoints())
        console.log(await airco.getDataPointValue(null))
      } catch(error) {
        console.error(error)
      }
    }
  })
  .catch(result => console.error(result))
