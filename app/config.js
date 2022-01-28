const path = require('path')
const ini_file = 'plugin.ini'
const cfg_path = path.join(__dirname, '/../config', ini_file)
const fs = require('fs')
const ini_parser = require('@adopisoft/core/utils/ini-parser.js')
const ini = require('ini')

exports.arrayToObj = list => {
  return list.reduce((obj, c, i) => {
    if (c.id) {
      obj[c.id] = c
    } else {
      obj[i] = c
    }
    return obj
  }, {})
}

exports.read = async () => {
  let root_dir = path.join(__dirname, '/..')
  let cfg = await ini_parser(ini_file, { root_dir })
  cfg.ports = Object.keys(cfg.ports).map(id => {
    const port = cfg.ports[id]
    port.id = parseInt(port.id)
    return port
  })
  cfg.rates = Object.keys(cfg.rates).map(id => {
    const rate = cfg.rates[id]
    rate.id = parseInt(rate.id)
    rate.amount = parseInt(rate.amount)
    rate.time_minutes = parseInt(rate.time_minutes)
    rate.exp_minutes = parseInt(rate.exp_minutes)
    return rate
  })
  console.log({cfg})
  return cfg
}

exports.save = async (cfg) => {
  if (!cfg) return
  cfg.ports = exports.arrayToObj(cfg.ports)
  cfg.rates = exports.arrayToObj(cfg.rates)
  await fs.promises.writeFile(cfg_path, ini.stringify(cfg))
}

// === PORTS SETTINGS =====
exports.validatePort = async (opts) => {
  let cfg = await exports.read()
  let is_conflict_pin = cfg.ports.find(p => p.id !== opts.id && p.pin === opts.pin)
  if (is_conflict_pin) {
    return Promise.reject(new Error(`GPIO PIN:${opts.pin} is already used`))
  }
  if (!opts.pin) {
    return Promise.reject(new Error('Please enter GPIO PIN'))
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

exports.addPort = async (opts) => {
  opts.pin = parseInt(opts.pin)
  opts.id = parseInt(Math.random() * (99999 - 999 + 1) + 999)
  await exports.validatePort(opts)
  let cfg = await exports.read()
  cfg.ports = cfg.ports || []
  let port = {
    id: opts.id,
    pin: opts.pin,
    alias: opts.alias
  }
  cfg.ports.push(port)
  await exports.save(cfg)
  return port
}

exports.updatePort = async (id, opts) => {
  opts.pin = parseInt(opts.pin)
  let cfg = await exports.read()
  let e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  await exports.validatePort({id, ...opts})
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
  let e = cfg.ports.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Port not found!'))
  cfg.ports.splice(e, 1)
  return exports.save(cfg)
}

// === RATES SETTINGS =====
exports.validateRate = async (opts) => {
  let cfg = await exports.read()
  let is_conflict = cfg.rates.find(p => p.id !== opts.id && p.amount === opts.amount)
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

  if (isNaN(opts.exp_minutes) || opts.exp_minutes < 0) {
    return Promise.reject(new Error('Please enter valid Expiration Time'))
  }
}

exports.addRate = async (opts) => {
  opts.time_minutes = parseInt(opts.time_minutes)
  opts.exp_minutes = parseInt(opts.exp_minutes)
  opts.amount = parseInt(opts.amount)
  opts.id = parseInt(Math.random() * (99999 - 999 + 1) + 999)
  await exports.validateRate(opts)
  let cfg = await exports.read()
  cfg.rates = cfg.rates || []
  let rate = {
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
  let e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Rate setting not found!'))
  await exports.validateRate({id, ...opts})
  let rate = {
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
  let e = cfg.rates.findIndex(p => p.id === id)
  if (e < 0) return Promise.reject(new Error('Rate setting not found!'))
  cfg.rates.splice(e, 1)
  return exports.save(cfg)
}
