const cfg = require('../config.js')

exports.get = async (req, res, next) => {
  try {
    let {captive_portal} = await cfg.read()
    res.json({captive_portal})
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    let {use_default_button} = req.body
    let config = await cfg.read()
    config.captive_portal = {
      use_default_button
    }
    await cfg.save(config)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
