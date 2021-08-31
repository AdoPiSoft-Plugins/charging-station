define([
  'knockout',
  '/public/plugins/charging-station/assets/scripts/ko/services/sessions.js',
  'toast',
  'http',
  'socket',
  'app/utils/parseCredits',
  'app/utils/formatDate'
],
function (ko, Session, toast, http, socket, parseCredits, formatDate) {
  return function Port (data) {
    var self = this;
    self.id = ko.observable(data.id);
    self.pin = ko.observable(data.pin);
    self.alias = ko.observable(data.alias);
    self.running = ko.observable(false)
    self.can_pause = ko.observable(false)
    self.formatted_time = ko.observable('-')

    function paddStart (i) {
      i = i + ''
      if (i.length >= 2) {
        return i
      } else {
        return '0' + i
      }
    }
    var sessions = []
    http.get('/charging-plugin/port/' + data.id + '/sessions', function (err, data) {
      if (err) return http.catchError(err);
      sessions = data
      if (sessions.length) {
        self.running(true)
        var formatted_time = ''
        var time = 0
        for (var i = 0; i < sessions.length; i++) {
          var s = sessions[i]
          let remaining_time_seconds = s.time_seconds - s.running_time_seconds
          if (s.is_owned && s.status === 'running') {
            self.can_pause(true)
          }
          time = time + remaining_time_seconds
        }

        self.interval = setInterval(function () {
          time--
          var t = time
          if (t > 0) {
            var hh = 0, mm = 0, ss = 0;
            if (t > 3600) {
              hh = parseInt(t / 3600)
              t = t - (hh * 3600)
            }
            if (t > 60) {
              mm = parseInt(t / 60)
              t = t - (mm * 60)
            }
            ss = t
            formatted_time = "<span class='calc-font'>" + paddStart(hh) + ':' + paddStart(mm) + ':' + paddStart(ss) + '</span>'
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
      })
      self.can_pause(false)
      self.formatted_time("<span class='calc-font'>00:00:00</span>")
      if (self.interval) clearInterval(self.interval)
    }

    self.dispose = function () {
      if (self.interval) clearInterval(self.interval)
    };
  };
});
