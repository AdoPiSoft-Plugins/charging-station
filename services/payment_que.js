const { machine_id, dbi } = require('../../core.js')
const NanoTimer = require('nanotimer')
const EventEmitter = require('events')
const Config = require('../config.js')

class PaymentQue extends EventEmitter {
  constructor (coinslot_id, device, charging_port_id, wait_payment_seconds, max_payment_retries) {
    super()
    this.coinslot_id = coinslot_id
    this.device = device
    this.charging_port_id = charging_port_id
    this.total_amount = 0
    this.default_wait_payment_seconds = wait_payment_seconds || 30
    this.wait_payment_seconds = wait_payment_seconds || 30
    this.max_payment_retries = max_payment_retries || 5
  }
  async start () {
    this.timer = new NanoTimer()
    this.timer.setInterval(() => {
      this.tick()
    }, '', '1s')
  }
  async tick () {
    this.wait_payment_seconds -= 1
    if (this.wait_payment_seconds === 0) {
      await this.done().catch(e => console.log(e))
    }
  }
  async prepare () {
    if (this.session || this.transaction) {
      return Promise.resolve(this)
    } else {
      const models = dbi.models
      this.transaction = await models.Transaction.create({
        machine_id,
        coinslot_id: this.coinslot_id,
        type: 'coin',
        amount: 0,
        mobile_device_mac: this.device.db_instance.mac_address,
        mobile_device_id: this.device.db_instance.id,
        customer_id: this.device.customer_id || null
      })
      this.session = await models.ChargingSession.create({
        machine_id,
        mobile_device_id: this.device.db_instance.id,
        transaction_id: this.transaction.id,
        charging_port_id: this.charging_port_id,
        time_seconds: 0,
        expire_minutes: 0
      })

      const { rates } = await Config.read()
      this.rates = rates.sort((a, b) => b.amount - a.amount)
      return this
    }
  }
  async paymentReceived(amount) {
    if (!(amount > 0)) return
    this.total_amount += amount
    await this.prepare()
    const time_seconds = this.computeTimeForPayment()
    const expire_minutes = this.computeExpForPayment()
    const update_session = this.session.update({
      expiration_date: null,
      time_seconds,
      expire_minutes
    })
    const update_transaction = this.transaction.update({ amount: this.total_amount })
    const create_payment = dbi.models.Payment.create({ transaction_id: this.transaction.id, amount })
    await Promise.all([update_session, update_transaction, create_payment])
    this.wait_payment_seconds = this.default_wait_payment_seconds

    const params = this.toJSON()
    params.amount = amount
    this.device.emit('payment:received', params)
  }
  computeTimeForPayment () {
    let tmp_amount = this.total_amount
    let time_seconds = 0
    this.rates.forEach(r => {
      const num_r = Math.floor(tmp_amount / r.amount)
      time_seconds += num_r * r.time_minutes * 60
      tmp_amount -= r.amount * num_r
    })
    return parseInt(time_seconds)
  }

  computeExpForPayment () {
    let tmp_amount = this.total_amount
    let exp_minutes = 0
    this.rates.forEach(r => {
      const num_r = Math.floor(tmp_amount / r.amount)
      exp_minutes += num_r * r.exp_minutes
      tmp_amount -= r.amount * num_r
    })
    return parseInt(exp_minutes)
  }

  async done () {
    const session = this.session ? Object.assign({}, this.session.get({ plain: true })) : null
    const transaction = this.transaction ? Object.assign({}, this.transaction.get({ plain: true })) : null
    if (session) delete session.machine_id
    if (transaction) delete transaction.machine_id
    this.timer.clearInterval()
    this.device.is_paying = false
    this.wait_payment_seconds = 0
    const param = this.toJSON()
    this.device.emit('payment:done', param)
    this.emit('done', param)
    this.device.payment_retries = this.total_amount > 0 ? 0 : this.device.payment_retries + 1
    if (this.device.payment_retries >= this.max_payment_retries) await this.device.suspend()
  }

  toJSON () {
    const s = this.session ? this.session.get({ plain: true }) : null
    const t = this.transaction ? this.transaction.get({ plain: true }) : null
    if (s) delete s.machine_id
    if (t) delete t.machine_id
    return {
      source: 'charging_plugin',
      coinslot_id: this.coinslot_id,
      type: this.type,
      total_amount: this.total_amount,
      wait_payment_seconds: this.wait_payment_seconds,
      transaction: t,
      session: s
    }
  }
}
module.exports = PaymentQue
