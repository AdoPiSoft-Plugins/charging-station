define([
  'knockout',
  'toast',
  'http',
  '/public/plugins/charging-station/scripts/ko/observables/session.js',
  'app/utils/array.find',
  'app/utils/array.map',
  'app/utils/array.filter'
], function (ko, toast, http, Session, find, map, filter) {
  var sessions = ko.observableArray([]);

  var util = {
    fetch: function (cb) {
      http.get('/charging-plugin/sessions', function (err, data) {
        if (typeof cb === 'function') cb(data)
        if (err) return http.catchError(err);
        sessions(map(data, function (s) {
          return new Session(s);
        }));
        util._fetchTimeout = setTimeout(function () {
          util.fetch();
        }, 5000);
      });
    },
    get: function () {
      return sessions;
    },
    find: function (id) {
      return find(sessions(), function (s) {
        return s.id === id || s.id() === id
      });
    },
    stopSync: function () {
      if (util._fetchTimeout) {
        clearTimeout(util._fetchTimeout);
        util._fetchTimeout = null;
      }
    },
    pauseSession: function (session) {
      var s = new Session(session)
      return s.pauseSession()
    }
  };

  return util;
});
