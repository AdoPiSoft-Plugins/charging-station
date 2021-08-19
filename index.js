var router = require('./router.js')
var { app } = require('plugin-core')

module.exports = {
  async init () {
    app.use(router)
  },
  uninstall () {
    // called with you uninstall the plugin
  }
}
