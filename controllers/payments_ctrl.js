var payments_manager = require('../services/payments_manager.js')
exports.quePayment = async (req, res, next) => {
  try {
    let {
      charging_port_id, coinslot_id,
      wait_payment_seconds, max_payment_retries
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
