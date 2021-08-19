(function () {
  function initChargingStation () {
    var btn = document.getElementById('charging-station-btn')
    if (btn) return
    btn = document.createElement('a')
    btn.classList.add('btn')
    btn.classList.add('btn-lg')
    btn.classList.add('btn-primary')
    btn.setAttribute('data-bind', "navigate: 'home-page'")
    btn.innerHTML = 'Charging Station'
    btn.id = 'charging-station-btn'
    btn.style['padding-left'] = '6px'
    var refBtn = document.querySelector('[data-bind="navigate: \'home-page\'"]')
    if (!refBtn) return
    refBtn.parentNode.insertBefore(btn, refBtn)
    var ko = require('knockout')
    var viewModel = ko.contextFor(refBtn.parentNode)
    ko.applyBindings(viewModel, btn)
  }

  document.body.addEventListener('click', function (e) {
    if (e.target && e.target.attributes['data-bind'] && (e.target.attributes['data-bind'].value || '').match(/navigate:\s?'more-buttons'/i)) {
      function isRender () {
        return !!document.querySelector('[data-bind="navigate: \'home-page\'"]')
      }

      if (isRender()) {
        initChargingStation()
      } else {
        var i = 0
        var interval = setInterval(function () {
          if (isRender()) {
            initChargingStation()
            clearInterval(interval)
          }
          if (i >= 10) clearInterval(interval)
        }, 100)
      }
    }
  })
})()
