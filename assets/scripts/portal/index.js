(function () {
  var http = require('http')
  var ko = require('knockout')
  var is_default_btn = false
  var scope
  function onKoPageReady (cb) {
    if (typeof cb !== 'function') return
    var lapse = 0
    var interval = setInterval(function () {
      var el = document.querySelector('[data-bind*="$root.currentPage"]')
      if (el) {
        scope = ko.contextFor(el)
        scope.$root.currentPage.subscribe(function (page) {
          setTimeout(function () {
            cb(page)
          }, 90)
        })
        setTimeout(function () {
          cb(scope.$root.currentPage())
        }, 90)
        clearInterval(interval)
      }
      lapse = lapse + 100
      if (lapse >= 5000) clearInterval(interval)
    }, 100)
  }

  function addChargingStationBtn () {
    var btn = document.getElementById('charging-station-btn')
    if (btn) return
    btn = document.createElement('a')
    btn.classList.add('btn')
    btn.classList.add('btn-lg')
    btn.classList.add('btn-primary')
    btn.setAttribute('data-bind', "navigate: 'buy-charging'")
    btn.innerHTML = 'Charging Station'
    btn.id = 'charging-station-btn'
    btn.style['padding-left'] = '6px'
    var con = document.querySelector('.btn-group-padded')
    if (!con) return
    con.insertBefore(btn, con.children[1])
    var viewModel = ko.contextFor(con.parentNode)
    ko.applyBindings(viewModel, btn)
  }
  var cache_bust = Math.random().toString().replace('.', '')
  http.get('/charging-plugin/portal-settings?cache_bust='+cache_bust, function (x, resp) {
    is_default_btn = resp && resp.captive_portal && resp.captive_portal.use_default_button
    onKoPageReady(function (page) {
      if (is_default_btn && page === 'more-buttons') {
        addChargingStationBtn()
      }

      http.get('/client/payments/current?cache_bust='+cache_bust, function (x, resp) {
        if (resp && resp.source === 'charging_plugin') {
          require("app/observables/payment").rateType('charging')
          scope = ko.contextFor(document.querySelector('[data-bind*="$root.currentPage"]'))
          scope.$root.navigate('charging-insert-coin')
        }
      })
    })
  })


  require(['/public/plugins/charging-station/assets/scripts/ko/main.js'])
})()
