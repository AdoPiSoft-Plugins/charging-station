define([
  'knockout',
  'toast',
  'http',
  '/public/plugins/charging-station/assets/scripts/ko/observables/port.js',
  'app/utils/array.find',
  'app/utils/array.map'
], function (ko, toast, http, Port, find, map) {
  var ports = ko.observableArray([]);

  var util = {
    fetch: function () {
      http.get('/charging-plugin/ports', function (err, data) {
        if (err) return http.catchError(err);
        map(ports(), function (p) {
          p.dispose()
        })
        ports(map(data, function (s) {
          return new Port(s);
        }));
        util._fetchTimeout = setTimeout(function () {
          util.fetch();
        }, 7000);
      });
    },
    get: function () {
      return ports;
    },
    find: function (id) {
      return find(ports(), function (s) {
        return s.id === id
      });
    },
    stopSync: function () {
      if (util._fetchTimeout) {
        clearTimeout(util._fetchTimeout);
        util._fetchTimeout = null;
      }
    }
  };

  return util;
});