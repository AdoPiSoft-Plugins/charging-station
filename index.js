var router = require('./router.js')
var { app } = require('plugin-core')
var models = require('./models')
var sessions_manager = require('./services/sessions_manager.js')

module.exports = {
  async init () {
    await models.init()
    app.use(router)
    await sessions_manager.init()
  },
  uninstall () {
    // called with you uninstall the plugin
  }
}
