define([
  'knockout'
], function (ko) {
  var assets_path = '/public/plugins/charging-station/assets/scripts/ko/pages/insert-coin'
  ko.components.register('charging-insert-coin', {
    viewModel: { require: assets_path + '/InsertCoinVM.js' },
    template: { require: 'text!' + assets_path + '/insert-coin.html' }
  });
});
