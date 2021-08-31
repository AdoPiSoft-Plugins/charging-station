define([
  'knockout',
  'toast',
  'http',
  'socket',
  'app/utils/parseCredits',
  'app/utils/formatDate'
],
function (ko, toast, http, socket, parseCredits, formatDate) {
  return function Session (data) {
    var self = this;
    self.id = ko.observable(data.id);
    self.type = ko.observable('time');
    self.remaining_time_seconds = ko.pureComputed(function () {
      return self.time_seconds() - self.running_time_seconds();
    });
    self.time_seconds = ko.observable(data.time_seconds);
    self.running_time_seconds = ko.observable(data.running_time_seconds);
    self.status = ko.observable(data.status);
    self.charging_port_id = ko.observable(data.charging_port_id);
    self.can_pause = ko.observable(data.can_pause);
    self.is_owned = ko.observable(data.is_owned);
    self.expiration_date = data.expiration_date;
    self.running = ko.observable(data.status === 'running');

    var formatted_time = ''
    var t = self.remaining_time_seconds()
    function paddStart (i) {
      i = i + ''
      if (i.length >= 2) {
        return i
      } else {
        return '0' + i
      }
    }
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
      formatted_time = ko.observable("<span class='calc-font'>" + paddStart(hh) + ':' + paddStart(mm) + ':' + paddStart(ss) + '</span>')
    } else {
      formatted_time = ko.observable("<span class='calc-font'>00:00:00</span>")
    }
    self.formatted_time = ko.observable(formatted_time);
    self.formatted_expiry_date = data.expiration_date
      ? formatDate(data.expiration_date)
      : 'N/A';
    self.starting = ko.observable(false);
    self.startSession = function (opts, cb) {
      self.starting(true);
      http.post('/charging-plugin/session/' + data.id + '/start', opts, function (err, data) {
        self.starting(false);
        if (err) {
          http.catchError(err);
        } else {
          self.status('running');
        }
        if (typeof cb === 'function') cb(err, data)
      });
    };
    self.pausing = ko.observable(false);
    self.pauseSession = function (opts) {
      self.pausing(true);
      http.post('/charging-plugin/session/' + data.id + '/pause', opts, function (err) {
        self.pausing(false);
        if (err) return http.catchError(err);
        self.status('available');
      });
    };
  };
});
