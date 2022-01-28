(function () {
  // eslint-disable-next-line no-undef
  var App = angular.module('Plugins')
  App.service('ChargingStation', [
    '$http',
    'toastr',
    'CatchHttpError',
    '$q',
    function ($http, toastr, CatchHttpError, $q) {
      this.getPorts = function () {
        return $http.get('/charging-plugin/ports').catch(CatchHttpError)
      }

      this.createPort = function (opts) {
        return $http.post('/charging-plugin/ports', opts)
      }

      this.updatePort = function (id, opts) {
        return $http.put('/charging-plugin/port/' + id, opts)
      }

      this.deletePort = function (id) {
        return $http.delete('/charging-plugin/port/' + id).catch(CatchHttpError)
      }

      this.getRates = function () {
        return $http.get('/charging-plugin/rates').catch(CatchHttpError)
      }

      this.createRate = function (opts) {
        return $http.post('/charging-plugin/rates', opts)
      }

      this.updateRate = function (id, opts) {
        return $http.put('/charging-plugin/rate/' + id, opts)
      }

      this.deleteRate = function (id) {
        return $http.delete('/charging-plugin/rate/' + id).catch(CatchHttpError)
      }

      this.getPortalSettings = function () {
        return $http.get('/charging-plugin/portal-settings').catch(CatchHttpError)
      }

      this.updatePortalSettings = function (opts) {
        return $http.post('/charging-plugin/portal-settings', opts).catch(CatchHttpError)
      }
    }
  ])
})()
