const EventEmitter = require('events')
// const SAVE_INTERVAL = 60

class Session extends EventEmitter {
  constructor (session_id) {
    super()
    this._tick_count = 0
    this.id = session_id
    this.status = null
    this.port = null
  }
}

module.exports = Session
