const EventEmitter = require('events')
const { dbi } = require('plugin-core')
const moment = require('moment')
const NanoTimer = require('nanotimer')
const SAVE_INTERVAL = 60
const Config = require('../config.js')
const path = require('path')
const cmd = require('../lib/cmd.js')

class Session extends EventEmitter {
  constructor (session_id) {
    super()
    this._tick_count = 0
    this.id = session_id
    this.status = null
    this.charging_port = null
    this.charging_port_id = null
    this.mobile_device_id = null
  }

  async load () {
    let s = await dbi.models.ChargingSession.findByPk(this.id)
    let charging_port_id = this.charging_port_id || s.charging_port_id
    let { ports } = await Config.read()
    this.mobile_device_id = s.mobile_device_id
    this.db_instance = s
    this.db_instance.charging_port_id = charging_port_id
    this.status = this.isExpired() ? 'expired' : 'available';
    this.charging_port_id = charging_port_id
    this.charging_port = ports.find(p => String(p.id) === String(charging_port_id))
    return s
  }

  async prestart () {
    if (this.status === 'running') {
      return Promise.reject('Session is already running')
    }

    if (this.isExpired()) {
      return Promise.reject('Session is already expired')
    }
    await this.load()
    const s = this.db_instance
    const {
      time_seconds,
      expire_minutes,
      running_time_seconds
    } = s

    if (running_time_seconds >= time_seconds) {
      return Promise.reject('Session is already consumed')
    }

    if (typeof expire_minutes === 'number') {
      var ts = time_seconds
      var expiration_date = moment()
        .add(expire_minutes, 'minutes')
        .add(ts, 'seconds')
        .toDate()

      await this.db_instance.update({ expiration_date, expire_minutes: null })
      Object.assign(this.db_instance, { expiration_date, expire_minutes: null })
    }
  }

  async start (port_id) {
    if (port_id) this.charging_port_id = port_id
    await this.prestart()
    this.startTick()
    this.turnOnGPIO()
    this.status = 'running'
    this.emit('start', this)
    return this
  }

  async timeTick () {
    try {
      if (this.isExpired()) { return this.stop() }

      this._tick_count++
      this.db_instance.running_time_seconds += 1
      if (this._tick_count >= SAVE_INTERVAL || this.db_instance.running_time_seconds >= this.db_instance.time_seconds) {
        this._tick_count = 0
        await this.save()
        if (this.db_instance.running_time_seconds >= this.db_instance.time_seconds) {
          await this.stop()
        }
      }
    } catch (e) {
      this.emit('error', e)
      await this.forceStop()
    }
  }

  startTick () {
    this.startTimeTick()
  }

  async refresh () {
    try {
      this.timer.clearInterval()
      this.status = 'available'
      await this.prestart()
      this.startTick()
      this.status = 'running'
    } catch (e) {
      this.status = 'running' // stop() throws error is session is not running
      await this.stop()
      throw e
    }
  }

  startTimeTick () {
    this.timer = new NanoTimer()
    this.timer.setInterval(() => {
      this.timeTick()
    }, '', '1s')
  }

  isExpired () {
    if (this.db_instance) {
      if (!this.db_instance.expiration_date) {
        return false
      } else {
        var max_date = moment(this.db_instance.expiration_date)
        return moment().isAfter(max_date, 'second')
      }
    } else { throw new Error('Session Instance not loaded') }
  }

  async pause () {
    try {
      await this.turnOffGPIO()
    } catch (e) {}
    if (this.status !== 'running') {
      return Promise.reject('Session is not running')
    }
    this.status = 'paused'
    this.timer.clearInterval()
    await this.save()
    this.emit('pause', this)
    return this
  }

  async forcePause () {
    try {
      await this.turnOffGPIO()
    } catch (e) {}
    this.status = 'paused'
    if (this.timer) this.timer.clearInterval()
    await this.save()
    return this
  }

  async stop () {
    if (this.status !== 'running') {
      return Promise.reject('Session is not running')
    }
    if (this.timer) this.timer.clearInterval()
    await this.turnOffGPIO()
    await this.save()
    this.status = this.isExpired() ? 'expired' : 'stopped'
    this.emit('stop', this)
    return this
  }

  async forceStop () {
    try {
      this.timer.clearInterval()
    } catch (e) {}
    try {
      await this.turnOffGPIO()
    } catch (e) {}
    try {
      await this.save()
    } catch (e) {}
    this.status = 'force_stopped'
    this.emit('stop', this)
    return this
  }

  async turnOffGPIO () {
    let port = this.charging_port
    try {
      console.log(`Toggle GPIO PIN: ${port.pin} 0`)
      await cmd(`${path.join(__dirname, '..', 'scripts', 'toggle-gpio.py')} ${port.pin} 0`)
    } catch (e) {
      console.log(e)
    }
    this.db_instance.charging_port_id = null
    this.charging_port_id = null
    this.charging_port = null
    await this.save()
  }

  async turnOnGPIO () {
    let port = this.charging_port
    try {
      console.log(`Toggle GPIO PIN: ${port.pin} 1`)
      await cmd(`${path.join(__dirname, '..', 'scripts', 'toggle-gpio.py')} ${port.pin} 1`)
    } catch (e) {
      console.log(e)
    }
  }

  async save () {
    try {
      await this.db_instance.save()
      return this
    } catch (e) {
      this.emit('error', e)
      await this.forceStop()
    }
  }

  async mobileDeviceIds () {
    return [this.db_instance.mobile_device_id]
  }

  async mobileDevices () {
    var ids = await this.mobileDeviceIds()
    return dbi.models.MobileDevice.findAll({ where: { id: ids } })
  }

  toJSON () {
    var {
      id, mobile_device_id,
      charging_port_id,
      time_seconds,
      running_time_seconds,
      expire_minutes,
      expiration_date, created_at, updated_at
    } = this.db_instance

    let { status } = this
    if (this.isExpired()) {
      status = 'expired'
    }
    return {
      id,
      status,
      mobile_device_id,
      charging_port_id,
      time_seconds,
      running_time_seconds,
      expire_minutes,
      expiration_date,
      created_at,
      updated_at
    }
  }
}

module.exports = Session
