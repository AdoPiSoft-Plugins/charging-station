const modules = require('@adopisoft/exports')
const ports_settings_ctrl = require('./controllers/ports_settings_ctrl.js')
const rates_settings_ctrl = require('./controllers/rates_settings_ctrl.js')
const portal_settings_ctrl = require('./controllers/portal_settings_ctrl.js')
const payments_ctrl = require('./controllers/payments_ctrl.js')
const sessions_ctrl = require('./controllers/sessions_ctrl.js')
const auth = require('@adopisoft/core/middlewares/auth.js')
const bodyParser = require('body-parser')
const ipv4 = require('@adopisoft/core/middlewares/ipv4.js')
const device_reg = require('@adopisoft/core/middlewares/device.js')
const current_customer = require('@adopisoft/core/middlewares/current_customer.js')
const cookie_parser = require('@adopisoft/core/middlewares/cookie_parser.js')
const device_cookie = require('@adopisoft/core/middlewares/device_cookie.js')
const express = require('express')
const router = express.Router()

router.use(cookie_parser)
router.use(device_cookie.read)
router.use(device_cookie.portalCookie)

router.get('/charging-plugin/ports', ports_settings_ctrl.get)
router.get('/charging-plugin/port/:id/sessions', ipv4, device_reg, sessions_ctrl.sessionsByPort)
router.post('/charging-plugin/port/:id/pause', ipv4, device_reg, sessions_ctrl.pausePortSessions)
router.post('/charging-plugin/ports',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  ports_settings_ctrl.create
)
router.put('/charging-plugin/port/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  ports_settings_ctrl.update
)
router.delete('/charging-plugin/port/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  ports_settings_ctrl.destroy
)
router.get('/charging-plugin/rates', auth, rates_settings_ctrl.get)
router.post('/charging-plugin/rates',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  rates_settings_ctrl.create
)
router.put('/charging-plugin/rate/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  rates_settings_ctrl.update
)
router.delete('/charging-plugin/rate/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  rates_settings_ctrl.destroy
)

router.get('/charging-plugin/portal-settings', portal_settings_ctrl.get)
router.post('/charging-plugin/portal-settings',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  auth,
  portal_settings_ctrl.update
)

router.post('/charging-plugin/payments/que', express.urlencoded({ extended: true }),
  bodyParser.json(),
  ipv4, device_reg,
  payments_ctrl.quePayment
)

router.post('/charging-plugin/wallet-payment', express.urlencoded({ extended: true }),
  bodyParser.json(),
  ipv4, device_reg, current_customer,
  payments_ctrl.walletPayment
)

router.get('/charging-plugin/sessions', express.urlencoded({ extended: true }),
  bodyParser.json(),
  ipv4, device_reg, sessions_ctrl.get
)

router.post('/charging-plugin/session/:id/start', express.urlencoded({ extended: true }),
  bodyParser.json(),
  ipv4, device_reg, sessions_ctrl.start
)

module.exports = router
