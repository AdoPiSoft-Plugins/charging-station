define([
  'knockout',
  'rootVM',
  'http',
  'sounds',
  'toast',
  'timerConfig',
  'wifiRates',
  'socket',
  'app/observables/device',
  'app/observables/receipt',
  'app/observables/payment',
  'app/utils/shortSecondsFormat',
  'app/utils/formatBytes',
  'app/utils/array.includes',
  'app/components/progress-bar/ProgressBar',
  'app/components/seconds-format/SecondsFormat'
], function (ko, rootVM, http, sounds, toast, timerConfig, rates, socket, device, receipt, payment, secondsFormat, formatBytes, includes) {
  function VM () {
    var prev_amount = 0;
    var fetch_timeout = null;
    var self = this;
    self.payment = payment;
    self.config = timerConfig;
    self.rates = rates;
    self.loading = ko.observable(false);
    self.que = {
      coinslot_id: ko.observable(0),
      total_amount: ko.observable(0),
      type: ko.observable(''),
      voucher: {},
      wait_payment_seconds: ko.observable(100),

      customer: ko.observable(0),
      eload_price: ko.observable(0),
      customer_credits: ko.observable(0),
      account_number: ko.observable(''),
      product_keyword: ko.observable('')
    };

    self.eload_wallet_topup = ko.pureComputed(function () {
      return includes(['eload', 'wallet_topup'], self.que.type());
    });

    self.session = {
      data_mb: ko.observable(0),
      time_seconds: ko.observable(0)
    };
    self.koDescendantsComplete = function () {
      rootVM.showingStatusNav(false);
      rootVM.showingBanners(false);
      rootVM.showingSessionsTable(false);
      self.fetch();
    };
    self.fetch = function () {
      http.currentPaymentQue(function (err, data) {
        if (err) return http.catchError(err);
        self.onPaymentReceived(data);
        fetch_timeout = setTimeout(function () {
          self.fetch();
        }, 2000);
      });
    };
    self.onPaymentReceived = function (data) {
      self.que.coinslot_id(data.coinslot_id);
      self.que.total_amount(data.total_amount);
      self.que.type(data.type);
      self.que.wait_payment_seconds(data.wait_payment_seconds);

      if (data.session) {
        self.session.time_seconds(data.session.time_seconds);
      }
      if (data.total_amount > prev_amount) {
        if (self.session.time_seconds() > 0) {
          toast.success('Total Amount: ' + rates.currency() + ' ' + self.que.total_amount(), 'Total Credits: ' + self.totalCredits());
          sounds.coinInserted.play();
        } else if (data.amount > 0) {
          toast.success('Payment Received: ' + rates.currency() + data.amount.toFixed(2));
          sounds.coinInserted.play();
        }
        prev_amount = data.total_amount;
      }
    };

    self.donePayment = function () {
      self.loading(true);
      http.donePayment(self.que.coinslot_id(), function (err, data) {
        if (err) {
          self.loading(false);
          http.catchError(err);
        }
        self.done(data);
      });
    };

    self.done = function (data) {
      device.is_paying(false);
      rootVM.navigate('buy-charging');
    };

    self.totalCredits = ko.pureComputed(function () {
      return secondsFormat(self.session.time_seconds());
    });

    self.hasPayment = ko.pureComputed(function () {
      return self.que.total_amount() > 0;
    });

    self.dispose = function () {
      socket().removeListener('payment:received', self.onPaymentReceived);
      socket().removeListener('payment:done', self.done);
      sounds.insertCoin.stop();
      sounds.insertCoinBg.stop();
      if (fetch_timeout) {
        clearTimeout(fetch_timeout);
      }
      if (device.is_paying()) {
        self.donePayment()
      }
    };

    receipt.reset();
    sounds.insertCoin.play();
    sounds.insertCoinBg.play();
    socket().on('payment:received', self.onPaymentReceived);
    socket().on('payment:done', self.done);
  }
  return VM;
});
