var src = '/plugins/charging-station/assets/scripts/ko'
define([
  'knockout',
  'rootVM',
  'http',
  src + '/services/ports.js',
  src + '/services/sessions.js',
  'app/observables/payment',
  'toast'
], function (ko, rootVM, http, ports, sessions, payment, toast) {
  return function () {
    var self = this
    self.loading = ko.observable(false)
    self.selected_session = ko.observable()
    self.sessions = sessions.get();
    self.ports = ports.get();
    self.koDescendantsComplete = function () {
      rootVM.showingStatusNav(false);
      rootVM.showingSessionsTable(false);
      rootVM.showingBanners(false);
      sessions.fetch();
      ports.fetch();
    };
    self.dispose = function () {
      sessions.stopSync();
      ports.stopSync();
    };

    self.selectSession = function (session_id) {
      self.selected_session(sessions.find(session_id))
    }

    self.cancelStartSession = function () {
      self.selected_session(null)
    }

    self.startPort = function (port_id) {
      var session = self.selected_session();
      if (!session || !port_id) return;
      session.startSession({ port_id: port_id }, function () {
        self.cancelStartSession()
        sessions.stopSync();
        ports.stopSync();
        ports.fetch();
        sessions.fetch();

        toast.success('Charging ON');
      });
    }

    self.addTime = function (port_id) {
      payment.intent(port_id);
      payment.rateType('charging');
      rootVM.navigate('charging-select-coinslot');
    }
  }
})
