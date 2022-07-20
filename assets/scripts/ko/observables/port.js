define([
  'knockout',
  '/plugins/charging-station/assets/scripts/ko/services/sessions.js',
  'toast',
  'http',
  'socket',
  'app/utils/formatDate',
  '/plugins/charging-station/assets/scripts/ko/utils/format-time.js',
  'app/utils/array.find'
],
function (ko, Session, toast, http, socket, formatDate, formatTime, find) {
  return function Port (data) {
    var self = this;
    self.id = ko.observable(data.id);
    self.pin = ko.observable(data.pin);
    self.alias = ko.observable(data.alias);
    self.running = ko.observable(false)
    self.is_owned = ko.observable(false)
    self.formatted_time = ko.observable('-')

    var sessions = []
    http.get('/charging-plugin/port/' + data.id + '/sessions', function (err, data) {
      if (err) return http.catchError(err);
      var running_session = find(data, function (s) {
        return s.status === 'running'
      })
      self.running(!!running_session)

      if (running_session) {
        self.is_owned(!!running_session.is_owned)
        sessions = data
      }
      if (sessions.length) {
        var formatted_time = ''
        var time = 0
        for (var i = 0; i < sessions.length; i++) {
          var s = sessions[i]
          let remaining_time_seconds = s.time_seconds - s.running_time_seconds
          time = time + remaining_time_seconds
        }

        self.interval = setInterval(function () {
          time--
          var t = time
          if (t > 0) {
            var ft = formatTime(t)
            formatted_time = "<span class='calc-font'>" + ft.hh + ':' + ft.mm + ':' + ft.ss + '</span>'
          } else {
            formatted_time = "<span class='calc-font'>00:00:00</span>"
          }
          self.formatted_time(formatted_time)
          if (t <= 0) clearInterval(self.interval)
        }, 1000)
      } else {
        self.formatted_time("<span class='calc-font'>00:00:00</span>")
      }
    });

    self.pauseSession = function () {
      http.post('/charging-plugin/port/' + data.id + '/pause', function (err, data) {
        if (err) return http.catchError(err);
        Session.stopSync();
        Session.fetch();

        toast.success('Charging OFF');
      })
      self.is_owned(false)
      self.running(false)
      self.formatted_time("<span class='calc-font'>00:00:00</span>")
      if (self.interval) clearInterval(self.interval)
    }

    self.dispose = function () {
      if (self.interval) clearInterval(self.interval)
    };
  };
});
