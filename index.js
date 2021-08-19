var config = require('./config.js')
var router = require('./router.js')
var { app } = require('plugin-core')

module.exports = {
  async init () {
    config.init()
    app.use(router)
  },
  uninstall () {
    // called with you uninstall the plugin
  }
}

