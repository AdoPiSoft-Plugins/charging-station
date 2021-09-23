const cfg = require('../config.js')

exports.get = async (req, res, next) => {
  try {
    let { ports } = await cfg.read()
    res.json(ports)
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    let port = await cfg.addPort(req.body)
    res.json(port)
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    let id = req.params.id
    let port = await cfg.updatePort(id, req.body)
    res.json(port)
  } catch (e) {
    next(e)
  }
}

exports.destroy = async (req, res, next) => {
  try {
    let id = req.params.id
    await cfg.deletePort(id)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
