const path = require('path')
const default_cfg = path.join(__dirname, 'charging_plugin.json')
const cfg_path = process.env.NODE_ENV === 'production' ? path.join('/etc', 'nigulp_gnigrahc.json') : default_cfg
const fs = require('fs')

exports.read = async () => {
  let _cfg_path
  try {
    await fs.promises.access(cfg_path)
    _cfg_path = cfg_path
  } catch (e) {
    _cfg_path = default_cfg
  }
  var cfg = await fs.promises.readFile(_cfg_path, 'utf8')
  return JSON.parse(cfg)
}
exports.save = async cfg => {
  if (!cfg) return
  return fs.promises.writeFile(cfg_path, JSON.stringify(cfg))
}
exports.validatePort = async (opts) => {
  let cfg = await exports.read()
  let is_confict_pin = cfg.ports.find(p => p.id !== opts.id && p.pin === opts.pin)
  if (is_confict_pin) {
    return Promise.reject(new Error(`GPIO PIN: ${opts.pin} is already used`))
  }
  if (!opts.pin) {
    return Promise.reject(new Error('Please Enter GPIO PIN'))
  }
  if (!opts.alias) {
    return Promise.reject(new Error('Please enter ALIAS'))
  }

  let is_conflict_alias = cfg.ports.find(p => p.id !== opts.id && p.alias === opts.alias)
  if (is_conflict_alias) {
    return Promise.reject(new Error('Please input different ALIAS'))
  }

  if (isNaN(parseInt(opts.pin))) {
    return Promise.reject(new Error('GPIO PIN is invalid'))
  }
}
exports.addPort = async (port) => {
  port.pin = parseInt(port.pin)
  port.id = parseInt(99001 * Math.random() + 999)
  await exports.validatePort(port)
  let cfg = await exports.read()
  cfg.ports = cfg.ports || []
  port = {
    id: port.id,
    pin: port.pin,
    alias: port.alias
  }
  cfg.ports.push(port)
  await exports.save(cfg)
  return port
}
exports.updatePort = async (id, opts) => {
  opts.pin = parseInt(opts.pin)
  let cfg = await exports.read()
  var e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  await exports.validatePort({
    id,
    ...opts
  })
  let port = {
    id,
    pin: opts.pin,
    alias: opts.alias
  }
  cfg.ports[e] = port
  await exports.save(cfg)
  return port
}
exports.deletePort = async (id) => {
  let cfg = await exports.read()
  var e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  cfg.ports.splice(e, 1)
  return exports.save(cfg)
}

exports.validateRate = async (opts) => {
  let cfg = await exports.read()
  let is_confict = cfg.rates.find(p => p.id !== opts.id && p.amount === opts.amount)
  if (is_confict) {
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
  if (isNaN(opts.exp_minutes) || opts.exp_minutes < 0) {
    return Promise.reject(new Error('Please enter valid Expiration Time'))
  }
}
exports.addRate = async (opts) => {
  opts.time_minutes = parseInt(opts.time_minutes)
  opts.exp_minutes = parseInt(opts.exp_minutes)
  opts.amount = parseInt(opts.amount)
  opts.id = parseInt(99001 * Math.random() + 999)
  await exports.validateRate(opts)
  let cfg = await exports.read()

  cfg.rates = cfg.rates || []
  const rate = {
    id: opts.id,
    amount: opts.amount,
    time_minutes: opts.time_minutes,
    exp_minutes: opts.exp_minutes
  }
  cfg.rates.push(rate)
  await exports.save(cfg)
  return rate
}
exports.updateRate = async (id, opts) => {
  opts.time_minutes = parseInt(opts.time_minutes)
  opts.amount = parseInt(opts.amount)
  opts.id = parseInt(id)
  let cfg = await exports.read()
  var e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Rate setting not found!'))
  await exports.validateRate({
    id,
    ...opts
  })
  const rate = {
    id,
    amount: opts.amount,
    time_minutes: opts.time_minutes,
    exp_minutes: opts.exp_minutes
  }
  cfg.rates[e] = rate
  await exports.save(cfg)
  return rate
}
exports.deleteRate = async (id) => {
  let cfg = await exports.read()
  var e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) {
    return Promise.reject(new Error('Rate setting not found!'))
  }
  cfg.rates.splice(e, 1)
  return exports.save(cfg)
}
