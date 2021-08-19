const cfg = require('../config.js')

exports.get = async (req, res, next) => {
  try {
    let { rates } = await cfg.read()
    res.json({ rates })
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    await cfg.addRate(req.body)
    let { rates } = await cfg.read()
    res.json({ rates })
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    await cfg.updateRate(id, req.body)
    let { rates } = await cfg.read()
    res.json({ rates })
  } catch (e) {
    next(e)
  }
}

exports.destroy = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    await cfg.deleteRate(id)
    let { rates } = await cfg.read()
    res.json({ rates })
  } catch (e) {
    next(e)
  }
}
