const sessions_manager = require('../services/sessions_manager.js')
exports.get = async (req, res, next) => {
  try {
    let { device } = req
    const list = await sessions_manager.deviceAvailableSessions(device.db_instance.id)
    res.json(list)
  } catch (e) {
    next(e)
  }
}
exports.sessionsByPort = async (req, res, next) => {
  try {
    const { device } = req
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
    const { device } = req
    const { port_id } = req.body
    const id = parseInt(req.params.id)
    let s = await sessions_manager.findSession(id)
    var owner_id = s.db_instance.mobile_device_id
    if (device.db_instance.id !== owner_id) {
      next("You don't own this session")
    }
    s.charging_port_id = port_id
    let db_instance = s.db_instance
    db_instance.charging_port_id = port_id
    await db_instance.save()
    await sessions_manager.startSession(s.id).catch(e => console.log(e))
    res.json(s.toJSON())
  } catch (e) {
    next(e)
  }
}
exports.pausePortSessions = async (req, res, next) => {
  try {
    const { device } = req
    const port_id = parseInt(req.params.id)
    const list = await sessions_manager.sessionsByPort(port_id)
    for (let i = 0; i < list.length; i++) {
      let s = list[i]
      if (s.mobile_device_id === device.db_instance.id) {
        await s.forcePause()
      }
    }

    res.json({ succes: true })
  } catch (e) {
    next(e)
  }
}