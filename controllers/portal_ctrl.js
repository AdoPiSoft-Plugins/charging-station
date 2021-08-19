var { payments_manager } = require('plugin-core')
const cfg = require('../config.js')

exports.listPorts = async (req, res, next) => {
  try {
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}

exports.quePayment = async (req, res, next) => {
  try {
    let { port_id } = req.body
    res.json({})
  } catch (e) {
    next(e)
  }
}
