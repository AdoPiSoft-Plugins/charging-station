const { payments_manager, coinslots_manager } = require('../../core.js')
const sessions_manager = require('./sessions_manager.js')
const PaymentQue = require('./payment_que.js')

exports.que = async (opts) => {
  let {
    coinslot_id,
    device,
    charging_port_id,
    wait_payment_seconds,
    max_payment_retries
  } = opts

  if (!payments_manager.isCoinslotAvailable(coinslot_id)) return Promise.reject('toast.error.SOMEONE_IS_PAYING')
  if (device.is_suspended) return Promise.reject('toast.error.PAYMENT_RETRIES_REACHED')

  let p = new PaymentQue(coinslot_id, device, charging_port_id, wait_payment_seconds, max_payment_retries)
  payments_manager.que_list.push(p)

  p.on('done', () => {
    const i = payments_manager.que_list.findIndex(x => String(x.coinslot_id) === String(coinslot_id))
    payments_manager.que_list.splice(i, 1)
    coinslots_manager.closeCoinslot(coinslot_id)
    if (p.session) {
      sessions_manager.startSession(p.session.id).catch(e => console.log(e))
    }
  })

  await p.start()
  await coinslots_manager.openCoinslot(coinslot_id)
  return p
}
