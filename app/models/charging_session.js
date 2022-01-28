'use strict'
var model_name = 'ChargingSession'
var table_name = 'charging_sessions'
var opts = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  timestamps: true,
  tableName: table_name
}

module.exports = (sequelize, Sequelize) => {
  var model = sequelize.define(model_name, {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true
    },
    machine_id: {
      type: Sequelize.STRING
    },
    mobile_device_id: {
      type: Sequelize.UUID
    },
    charging_port_id: {
      allowNull: true,
      type: Sequelize.INTEGER
    },
    time_seconds: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    running_time_seconds: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    expire_minutes: {
      allowNull: true,
      type: Sequelize.INTEGER
    },
    expiration_date: {
      allowNull: true,
      type: Sequelize.DATE
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }, opts)

  return model
}
