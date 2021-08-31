const cfg = require('../config.js')

exports.get = async (req, res, next) => {
  try {
    let { rates } = await cfg.read()
    res.json(rates)
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    let rate = await cfg.addRate(req.body)
    res.json(rate)
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    let rate = await cfg.updateRate(id, req.body)
    res.json(rate)
  } catch (e) {
    next(e)
  }
}

exports.destroy = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id)
    await cfg.deleteRate(id)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
