define(['knockout'], function (ko) {
  var assets_path = '/public/plugins/charging-station/assets/scripts/ko/pages/select-coinslot'
  ko.components.register('charging-select-coinslot', {
    viewModel: { require: assets_path + '/SelectCoinslotVM.js' },
    template: { require: 'text!app/pages/select-coinslot/select-coinslot-page.html' }
  });
});
