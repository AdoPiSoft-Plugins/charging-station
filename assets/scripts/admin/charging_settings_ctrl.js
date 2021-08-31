(function () {
  // eslint-disable-next-line no-undef
  var App = angular.module('Plugins')
  App.controller('ChargingStationSettingsCtrl', function ($scope, ChargingStation, CatchHttpError, toastr, $ngConfirm) {
    $scope.active_tab = 0
    $scope.new_rate = {id: 0, amount: 0, time_minutes: 0, exp_minutes: 0}
    $scope.new_port = {id: 0, pin: 0, alias: ''}
    function loadPorts () {
      return ChargingStation.getPorts().then(function (res) {
        $scope.ports = res.data || []
      })
    }
    function loadRates () {
      return ChargingStation.getRates().then(function (res) {
        $scope.rates = res.data || []
      })
    }
    loadPorts()
    loadRates()

    $scope.newPort = function () {
      $scope.ports.push($scope.new_port)
    }

    $scope.savePort = function (id, opts, form) {
      if (id === 0) {
        return ChargingStation.createPort(opts).then(function (res) {
          loadPorts()
          return res.data
        }).catch(function (e) {
          setTimeout(function () {
            form.$show()
          }, 200)
          CatchHttpError(e)
          return false
        })
      } else {
        return ChargingStation.updatePort(id, opts).then(function (res) {
          return res.data
        }).catch(function (e) {
          setTimeout(function () {
            form.$show()
          }, 200)
          CatchHttpError(e)
          return false
        })
      }
    }

    $scope.deletePort = function (id) {
      $ngConfirm({
        title: 'Confirm',
        content: 'Are you sure you want to delete this Port?',
        escapeKey: 'close',
        buttons: {
          ok: {
            text: 'Yes',
            btnClass: 'btn-danger',
            keys: ['enter'],
            action: function () {
              return ChargingStation.deletePort(id).then(function (res) {
                return loadPorts()
              })
            }
          },
          close: {
            text: 'Cancel',
            keys: ['escape'],
            btnClass: 'btn-default'
          }
        }
      })
    }

    $scope.cancelPortForm = function (id) {
      $scope.ports = $scope.ports.filter(function (p) { return p.id !== 0 })
    }

    $scope.newRate = function () {
      $scope.rates.push($scope.new_rate)
    }

    $scope.saveRate = function (id, opts, form) {
      if (id === 0) {
        return ChargingStation.createRate(opts).then(function (res) {
          loadRates()
          return res.data
        }).catch(function (e) {
          setTimeout(function () {
            form.$show()
          }, 200)
          CatchHttpError(e)
          return false
        })
      } else {
        return ChargingStation.updateRate(id, opts).then(function (res) {
          return res.data
        }).catch(function (e) {
          setTimeout(function () {
            form.$show()
          }, 200)
          CatchHttpError(e)
          return false
        })
      }
    }

    $scope.deleteRate = function (id) {
      $ngConfirm({
        title: 'Confirm',
        content: 'Are you sure you want to delete this Rate?',
        escapeKey: 'close',
        buttons: {
          ok: {
            text: 'Yes',
            btnClass: 'btn-danger',
            keys: ['enter'],
            action: function () {
              return ChargingStation.deleteRate(id).then(function (res) {
                return loadRates()
              })
            }
          },
          close: {
            text: 'Cancel',
            keys: ['escape'],
            btnClass: 'btn-default'
          }
        }
      })
    }

    $scope.cancelRateForm = function (id) {
      $scope.rates = $scope.rates.filter(function (r) { return r.id !== 0 })
    }

    $scope.captive_portal = {use_default_button: true}
    ChargingStation.getPortalSettings().then(function (res) {
      $scope.captive_portal = (res.data || {}).captive_portal
    })

    $scope.updatePortalSettings = function () {
      return ChargingStation.updatePortalSettings($scope.captive_portal)
    }
  })
})()