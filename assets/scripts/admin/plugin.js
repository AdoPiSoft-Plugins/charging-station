(function(){angular.module("Plugins").config(function($stateProvider){$stateProvider.state("plugins.charging_station",{templateUrl:"/public/plugins/charging-station/views/settings.html",controller:"ChargingStationSettingsCtrl",url:"/charging-station",title:"Charging Station",sidebarMeta:{order:1}})})})();