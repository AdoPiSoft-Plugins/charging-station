const path = require('path')
const default_cfg = path.join(__dirname, 'charging_plugin.json')
const cfg_path = process.ENV.NODE_ENV === 'production' ? path.join('/etc', 'nigulp_gnigrahc.json') : default_cfg
const fs = require('fs')

exports.read = async () => {
  let _cfg_path
  try {
    await fs.promises.access(cfg_path)
    _cfg_path = cfg_path
  } catch (e) {
    _cfg_path = default_cfg
  }
  return fs.promises.readFile(_cfg_path, 'utf8')
}

exports.save = async (cfg) => {
  if (!cfg) return
  return fs.promises.writeFile(cfg_path, JSON.stringify(cfg))
}

// === PORTS SETTINGS =====
exports.validatePort = async (opts) => {
  let cfg = await exports.read()
  let is_conflict = cfg.ports.find(p => p.id !== opts.id && p.pin === opts.pin)
  if (is_conflict) {
    return Promise.reject(new Error(`GPIO PIN:${opts.pin} is already used`))
  }
  if (!opts.pin) {
    return Promise.reject(new Error('Please enter GPIO PIN'))
  }
  if (!opts.alias) {
    return Promise.reject(new Error('Please enter ALIAS'))
  }
  if (isNaN(parseInt(opts.pin))) {
    return Promise.reject(new Error('GPIO PIN is invalid'))
  }
}

exports.addPort = async (opts) => {
  opts.pin = parseInt(opts.pin)
  opts.id = parseInt(Math.random() * (99999 - 999 + 1) + 999)
  await exports.validatePort(opts)
  let cfg = await exports.read()
  cfg.ports = cfg.ports || []
  cfg.ports.push({
    id: opts.id,
    pin: opts.pin,
    alias: opts.alias
  })
  return exports.save(cfg)
}

exports.updatePort = async (id, opts) => {
  opts.pin = parseInt(opts.pin)
  let cfg = await exports.read()
  let e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  await exports.validatePort({id, ...opts})
  cfg.ports[e] = {
    id,
    pin: opts.pin,
    alias: opts.alias
  }
  return exports.save(cfg)
}

exports.deletePort = async (id) => {
  let cfg = await exports.read()
  let e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  cfg.ports.splice(e, 1)
  return exports.save(cfg)
}

// === RATES SETTINGS =====
exports.validateRate = async (opts) => {
  let cfg = await exports.read()
  let is_conflict = cfg.ports.find(p => p.id !== opts.id && p.amount === opts.amount)
  if (is_conflict) {
    return Promise.reject(new Error(`Amount ${opts.amount} already exists`))
  }
  if (!opts.amount) {
    return Promise.reject(new Error('Please enter Amount'))
  }
  if (!opts.time_minutes) {
    return Promise.reject(new Error('Please enter Time'))
  }
  if (isNaN(parseInt(opts.time_minutes)) || parseInt(opts.time_minutes) <= 0) {
    return Promise.reject(new Error('Please enter valid Time'))
  }
}

exports.addRate = async (opts) => {
  opts.time_minutes = parseInt(opts.time_minutes)
  opts.amount = parseInt(opts.amount)
  opts.id = parseInt(Math.random() * (99999 - 999 + 1) + 999)
  await exports.validateRate(opts)
  let cfg = await exports.read()
  cfg.rates = cfg.rates || []
  cfg.rates.push({
    id: opts.id,
    amount: opts.amount,
    time_minutes: opts.time_minutes
  })
  return exports.save(cfg)
}

exports.updateRate = async (id, opts) => {
  opts.time_minutes = parseInt(opts.time_minutes)
  opts.amount = parseInt(opts.amount)
  let cfg = await exports.read()
  let e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Rate setting not found!'))
  await exports.validateRate({id, ...opts})
  cfg.rates[e] = {
    id,
    amount: opts.amount,
    time_minutes: opts.time_minutes
  }
  return exports.save(cfg)
}

exports.deleteRate = async (id) => {
  let cfg = await exports.read()
  let e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Rate setting not found!'))
  cfg.ports.splice(e, 1)
  return exports.save(cfg)
}
