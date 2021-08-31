define([
  'knockout'
], function (ko) {
  var assets_path = '/public/plugins/charging-station/assets/scripts/ko/pages/buy-charging'
  ko.components.register('buy-charging', {
    viewModel: { require: assets_path + '/BuyChargingVM.js' },
    template: { require: 'text!' + assets_path + '/buy-charging.html' }
  })
})
