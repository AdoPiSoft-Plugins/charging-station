const router = require('./router.js')
const { app } = require('../core.js')
const AppConfig = require('./app_config.js')
const models = require('./models')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const sessions_manager = require('./services/sessions_manager.js')

module.exports = {
  async init () {
    await models.init()
    app.use(router)
    await sessions_manager.init()
    let { hardware } = await AppConfig.readAppConfig()

    const rpi_boards = ['rpi_3', 'rpi_4']
    const tinker_boards = ['tinker']
    const opi_boards = AppConfig.hardwares.filter(h => {
      return !rpi_boards.includes(h.code) && !tinker_boards.includes(h.code) && h.board_name
    }).map(h => h.code)

    let script = 'toggle-gpio-' + (
      rpi_boards.includes(hardware)
        ? 'rpi.py'
        : tinker_boards.includes(hardware)
          ? 'tinker.py'
          : opi_boards.includes(hardware)
            ? 'opi.py'
            : 'generic.py'
    )

    if (opi_boards.includes(hardware)) {
      var opi_board = AppConfig.hardwares.find(h => h.code === hardware).board_name
    }
    const tpl = await readFile(path.join(__dirname, 'scripts', script), 'utf8')

    if (process.env.NODE_ENV !== 'production') {
      return console.log('/etc/toggle-gpio.py', tpl.replace(/BOARD_NAME/g, opi_board))
    }

    await writeFile('/etc/toggle-gpio.py', tpl.replace(/BOARD_NAME/g, opi_board))
  },

  uninstall () {}
}
