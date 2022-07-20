(function () {
  // eslint-disable-next-line no-undef
  angular.module('Plugins').config(function ($stateProvider) {
    $stateProvider.state('plugins.charging_station', {
      templateUrl: '/plugins/charging-station/views/settings.html',
      controller: 'ChargingStationSettingsCtrl',
      url: '/charging-station',
      title: 'Charging Station',
      sidebarMeta: {
        order: 1
      }
    })
  })
})()
