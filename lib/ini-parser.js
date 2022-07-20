const ini = require('ini')
const path = require('path')
const fs = require('fs')
const util = require('util')
const read_file = util.promisify(fs.readFile)

function readDefaults (file) {
  const defaults_path = path.join(process.env.APPDIR, 'config', 'defaults')
  const default_config_path = path.join(defaults_path, file)
  return read_file(default_config_path, 'utf8').then(txt => {
    return ini.decode(txt)
  })
}

function readUserConfig (file) {
  const user_ini_path = path.join(process.env.APPDIR, 'config', file)
  return read_file(user_ini_path, 'utf8')
    .then(txt => {
      return ini.decode(txt)
    })
    .catch(e => {
      return false
    })
}

module.exports = (ini_file, opts) => {
  opts = opts || {}
  opts.merge = typeof opts.merge === 'boolean' ? opts.merge : true

  return readDefaults(ini_file).then(default_config => {
    return readUserConfig(ini_file).then(user_config => {
      const cfg = opts.merge && user_config ? Object.assign(default_config, user_config) : user_config || default_config
      return cfg
    })
  })
}
