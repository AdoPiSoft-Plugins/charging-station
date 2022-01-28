var src = '/public/plugins/charging-station/scripts/ko'
define([
  'knockout',
  'rootVM',
  'toast',
  'http',
  'app/observables/payment',
  'app/observables/device',
  'app/observables/customer',
  'modal',
  'timerConfig',
  'app/utils/array.includes',
  src + '/components/wallet-prompt/WalletPrompt.js'
], function (ko, rootVM, toast, http, payment, device, customer, modal, timerConfig, includes) {
  return function () {
    var self = this;
    self.selectedId = ko.observable('');
    self.loading = ko.observable(true);
    self.coinslots = ko.observableArray([]);

    self.koDescendantsComplete = function () {
      rootVM.showingStatusNav(false);
      rootVM.showingBanners(true);
      rootVM.showingSessionsTable(false);

      http.get('/portal/coinslots?rate_type=charging', function (err, coinslots) {
        if (err) return http.catchError(err);
        self.coinslots(coinslots);
        self.loading(false);

        if (customer.credits() > 0) {
          modal.show('charging-wallet-prompt', { customer: customer, charging_port_id: payment.intent() });
        } else if (coinslots.length === 1) {
          self.selectCoinslot(coinslots[0].id);
        }
      });
    };

    self.selectCoinslot = function (coinslot_id) {
      self.selectedId(coinslot_id);
      self.loading(true);
      var params = {
        coinslot_id: coinslot_id,
        charging_port_id: payment.intent(),
        wait_payment_seconds: timerConfig.wait_payment_seconds,
        max_payment_retries: timerConfig.max_payment_retries
      }

      http.post('/charging-plugin/payments/que', params, function (err) {
        if (err) {
          http.catchError(err);
          self.loading(false);
        } else {
          rootVM.navigate('charging-insert-coin')
        }
      });
    };
  };
});
