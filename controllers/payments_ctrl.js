const payments_manager = require('../services/payments_manager.js')
const sessions_manager = require('../services/sessions_manager.js')
const { dbi, machine_id } = require('../../core.js')
const PaymentQue = require('../services/payment_que.js')
const Config = require('../config.js')

exports.quePayment = async (req, res, next) => {
  try {
    let {
      charging_port_id,
      coinslot_id,
      wait_payment_seconds,
      max_payment_retries
    } = req.body
    let { device } = req

    await payments_manager.que({
      coinslot_id,
      device,
      charging_port_id,
      wait_payment_seconds,
      max_payment_retries
    })
    res.json({
      type: 'charging',
      total_amount: 0,
      credits: 0
    })
  } catch (e) {
    next(e)
  }
}
exports.walletPayment = async (req, res, next) => {
  try {
    let { amount, charging_port_id } = req.body
    let { customer, device } = req

    customer = await dbi.models.Customer.findByPk(customer.id)
    if (amount > customer.credits) {
      return next('Insufficient wallet')
    }
    await customer.update({ credits: customer.credits - amount })
    const q = new PaymentQue(null, device, charging_port_id)
    const { rates, ports } = await Config.read()

    q.rates = rates.sort((a, b) => b.amount - a.amount)
    q.total_amount = amount

    let credits = q.computeTimeForPayment()
    let exp = q.computeExpForPayment()

    let session = await dbi.models.ChargingSession.create({
      machine_id,
      mobile_device_id: device.db_instance.id,
      charging_port_id,
      time_seconds: credits,
      expire_minutes: exp
    })
    await sessions_manager.startSession(session.id).catch(e => console.log(e))
    var port = ports.find(p => p.id === charging_port_id)
    res.json({...session.get({ plain: true}), charging_port: port})
  } catch (e) {
    next(e)
  }
}