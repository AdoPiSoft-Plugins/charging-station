module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('charging_sessions', {
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
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('charging_sessions');
  }
}
