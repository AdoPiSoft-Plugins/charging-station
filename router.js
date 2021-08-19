const core = require('plugin-core')
const { router, middlewares } = core
const ports_settings_ctrl = require('./controllers/ports_settings_ctrl.js')
const rates_settings_ctrl = require('./controllers/rates_settings_ctrl.js')
// const portal_ctrl = require('./controllers/portal_ctrl.js')
const { express, bodyParser, device_reg } = middlewares

router.get('/charging-plugin/ports', core.middlewares.auth, ports_settings_ctrl.get)
router.post('/charging-plugin/ports',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  ports_settings_ctrl.create
)
router.put('/charging-plugin/port/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  ports_settings_ctrl.update
)
router.delete('/charging-plugin/port/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  ports_settings_ctrl.destroy
)
router.get('/charging-plugin/rates', core.middlewares.auth, rates_settings_ctrl.get)
router.post('/charging-plugin/rates',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  rates_settings_ctrl.create
)
router.put('/charging-plugin/rate/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  rates_settings_ctrl.update
)
router.delete('/charging-plugin/rate/:id',
  express.urlencoded({ extended: true }),
  bodyParser.json(),
  core.middlewares.auth,
  rates_settings_ctrl.destroy
)
