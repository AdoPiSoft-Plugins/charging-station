const sessions_manager = require('../services/sessions_manager.js')

exports.get = async (req, res, next) => {
  try {
    let { device } = req
    let list = await sessions_manager.deviceAvailableSessions(device.db_instance.id)
    res.json(list)
  } catch (e) {
    next(e)
  }
}

exports.sessionsByPort = async (req, res, next) => {
  try {
    let { device } = req
    let port_id = parseInt(req.params.id)
    let list = (await sessions_manager.sessionsByPort(port_id)).map(s => s.toJSON())
    for (let i = 0; i < list.length; i++) {
      let s = list[i]
      if (s.mobile_device_id === device.db_instance.id) {
        s.is_owned = true
        s.can_pause = true
      }
    }
    res.json(list)
  } catch (e) {
    next(e)
  }
}

exports.start = async (req, res, next) => {
  try {
    let { device } = req
    let { port_id } = req.body
    let id = parseInt(req.params.id)
    let s = await sessions_manager.findSession(id)
    let owner_id = s.db_instance.mobile_device_id
    if (device.db_instance.id !== owner_id) {
      next("You don't own this session")
    }
    await s.start(port_id)
    res.json(s.toJSON())
  } catch (e) {
    next(e)
  }
}

exports.pausePortSessions = async (req, res, next) => {
  try {
    let { device } = req
    let port_id = parseInt(req.params.id)
    let list = await sessions_manager.sessionsByPort(port_id)
    for (let i = 0; i < list.length; i++) {
      let s = list[i]
      if (s.mobile_device_id === device.db_instance.id) {
        await s.forcePause()
      }
    }
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
