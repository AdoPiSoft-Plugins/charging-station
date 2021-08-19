const cfg = require('../config.js')

exports.get = async (req, res, next) => {
  try {
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    await cfg.addPort(req.body)
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    await cfg.updatePort(id, req.body)
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}

exports.destroy = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    await cfg.deletePort(id)
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}
