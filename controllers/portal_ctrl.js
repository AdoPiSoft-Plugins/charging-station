const cfg = require('../config.js')

exports.listPorts = async (req, res, next) => {
  try {
    let { ports } = await cfg.read()
    res.json({ ports })
  } catch (e) {
    next(e)
  }
}
