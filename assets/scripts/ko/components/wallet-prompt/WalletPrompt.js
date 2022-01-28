define([
  'knockout',
  'rootVM',
  'wifiRates',
  'http',
  'app/observables/receipt',
  'text!app/components/wallet-prompt/wallet-prompt.html',
  '/public/plugins/charging-station/scripts/ko/utils/format-time.js',
  'app/utils/formatBytes',
  'toast',
  'app/components/seconds-format/SecondsFormat'
], function (ko, rootVM, wifiRates, http, receipt, tpl, formatTime, formatBytes, toast) {
  function VM (params) {
    var self = this;
    self.charging_port_id = params.charging_port_id
    self.customer = params.customer;
    self.close = params.close;
    self.amount = ko.observable('');
    self.currency = wifiRates.currency();

    self.payNow = function () {
      var amount = self.amount();
      if (amount > 0 && amount <= self.customer.credits()) {
        var opts = { amount: amount, charging_port_id: self.charging_port_id };

        http.post('/charging-plugin/wallet-payment', opts, function (err, data) {
          if (err) {
            return toast.error(err.responseText);
          }

          var session = data
          var charging_port = data.charging_port
          var ft = formatTime(session.time_seconds)
          ft = ft.hh + ':' + ft.mm + ':' + ft.ss
          self.close();
          toast.success(ft + ' time credits added to charging port ' + charging_port.alias);
          rootVM.navigate('buy-charging');
        });
      }
    };

    self.koDescendantsComplete = function () {
      document.getElementById('wallet-amount').focus();
    };
  }

  ko.components.register('charging-wallet-prompt', {
    viewModel: VM,
    template: tpl
  });
});
