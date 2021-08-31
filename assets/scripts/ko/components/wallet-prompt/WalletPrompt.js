var src = '/public/plugins/charging-station/assets/scripts/ko'
define([
  'knockout',
  'rootVM',
  'wifiRates',
  'http',
  'app/observables/receipt',
  'text!' + src + '/components/wallet-prompt/wallet-prompt.html',
  'app/utils/shortSecondsFormat',
  'app/utils/formatBytes',
  'toast',
  'app/components/seconds-format/SecondsFormat'
], function (ko, rootVM, wifiRates, http, receipt, tpl, secondsFormat, formatBytes, toast) {
  function VM (params) {
    var self = this;
    var rate_type = 'charging';
    self.customer = params.customer;
    self.close = params.close;
    self.amount = ko.observable('');
    self.currency = wifiRates.currency();

    self.payNow = function () {
      var amount = self.amount();
      if (amount > 0 && amount <= self.customer.credits()) {
        var opts = { amount: amount, rate_type: rate_type };

        http.post('/charging-plugin/wallet-payment', opts, function (err, data) {
          if (err) {
            return toast.error(err.responseText);
          }

          data = self.parseData(data);
          data.transaction = { amount: amount, total_amount: amount };

          receipt.isVoucher(false);
          receipt.amount(amount);
          receipt.type(rate_type);
          receipt.credits(self.totalCredits(data));
          self.close();
        });
      }
    };

    self.parseData = function (data) {
      if (data.voucher) {
        data.session = data.voucher;
        data.session.data_mb = data.voucher.megabytes;
        data.session.time_seconds = data.voucher.minutes * 60;
      } else if (data.session) {
        var session = data.session;
        data.session.data_mb = parseFloat(session.data_mb) - parseFloat(session.data_consumption_mb);
        data.session.time_seconds = parseFloat(session.time_seconds) - parseFloat(session.running_time_seconds);
      } else {
        data.session = { data_mb: 0, time_seconds: 0 };
      }
      return data;
    };

    self.totalCredits = function (data) {
      if (rate_type === 'time') {
        return secondsFormat(data.session.time_seconds);
      }
      if (rate_type === 'data') {
        return formatBytes(data.session.data_mb);
      }
      if (rate_type === 'time_or_data') {
        var s = secondsFormat(data.session.time_seconds);
        var d = formatBytes(data.session.data_mb);
        return s + '/' + d;
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
