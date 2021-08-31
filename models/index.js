'use strict'

var { dbi, machine_id } = require('plugin-core')
var ChargingSession = require('./charging_session')

var model_files = {
  ChargingSession
}

exports.init = async () => {
  if (!dbi) return
  var { sequelize, Sequelize } = dbi
  var db = await sequelize.getInstance()

  var keys = Object.keys(model_files)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    dbi.models[k] = model_files[k](db, Sequelize)
    try {
      await dbi.models[k].sync({alter: true})
    } catch (e) {}
  }

  var default_scope = {
    where: { machine_id }
  }

  dbi.models.ChargingSession.addScope('default_scope', default_scope)
  dbi.models.ChargingSession.belongsTo(dbi.models.MobileDevice)
  dbi.models.MobileDevice.hasMany(dbi.models.ChargingSession)

  return dbi
}
