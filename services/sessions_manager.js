const { dbi } = require('plugin-core')
const Session = require('./session.js')
const Config = require('../config.js')
const { Sequelize } = dbi

exports.list = []

exports.init = async () => {
  const { Op } = Sequelize
  let sessions = await dbi.models.ChargingSession.findAll({
    where: {
      time_seconds: { [Op.gt]: Sequelize.col('running_time_seconds') },
      expiration_date: {
        [Op.or]: [
          { [Op.gt]: new Date() },
          { [Op.is]: null }
        ]
      }
    }
  })
  for (var i = 0; i < sessions.length; i++) {
    let s = sessions[i]
    try {
      await exports.startSession(s.id)
    } catch (e) {
      console.log(e)
    }
  }
}

exports.deviceAvailableSessions = async (device_id) => {
  return exports.list.filter(s => {
    return s.mobile_device_id === device_id &&
    !['expired', 'stopped'].includes(s.status) &&
    s.charging_port_id === null &&
    !s.isExpired()
  })
}

exports.sessionsByPort = async (port_id) => {
  return exports.list.filter(s => {
    return s.charging_port_id === port_id &&
    !['expired', 'stopped'].includes(s.status) &&
    !s.isExpired()
  })
}

exports.startSession = async (session_id) => {
  let session = await exports.findSession(session_id)
  let { charging_port_id } = session
  session.on('error', async (e) => {
    console.log(e)
  })
  session.on('stop', async () => {
    try {
      let [s] = await exports.sessionsByPort(charging_port_id)
      if (s && s.mobile_device_id === session.mobile_device_id) {
        await exports.startSession(s.id) // auto-continue
      }
    } catch (e) { console.log(e) }

    try {
      await exports.stopSession(session_id)
    } catch (e) { console.log(e) }
  })

  try {
    await exports.isSessionLoaded(session_id)
  } catch (e) {
    exports.list.push(session)
  }

  let exist = exports.list.find(s => s.status === 'running' && s.charging_port_id === charging_port_id)
  if (exist) return Promise.reject('Charging port has existing running session')

  let { ports } = await Config.read()
  let charging_port = ports.find(p => String(p.id) === String(charging_port_id))
  if (!charging_port) {
    return Promise.reject('Charging port not set')
  }
  await session.start()
  return session
}

exports.stopSession = async (session_id) => {
  const session = await exports.isSessionLoaded(session_id)
  return new Promise(resolve => {
    session.on('terminated', () => {
      session.removeAllListeners()
      resolve(session)
    })
    session.stop().catch(e => {
      session.removeAllListeners()
      resolve(session)
    })
  })
}

exports.isSessionLoaded = async (session_id) => {
  const session = exports.list.find(s => s.db_instance.id === session_id)
  if (session) return session
  else throw new Error('Session not loaded')
}

exports.findSession = async (session_id) => {
  try {
    return await exports.isSessionLoaded(session_id)
  } catch (e) {
    return exports.loadSession(session_id)
  }
}

exports.loadSession = async (session_id) => {
  const session = new Session(session_id)
  await session.load()
  return session
}
