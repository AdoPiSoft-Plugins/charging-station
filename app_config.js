const ini_parser = require('./lib/ini-parser.js');
exports.hardwares = [{
    code: 'x64_pc',
    display: 'Generic x64 Machine'
  }, {
    code: 'generic_armhf',
    display: 'Generic ARM Board'
  }, {
    code: 'tinker',
    display: 'ASUS Tinker Board'
  }, {
    code: 'rpi_3',
    display: 'Raspberry Pi 3'
  }, {
    code: 'rpi_4',
    display: 'Raspberry Pi 4'
  }, {
    code: 'opi_lite',
    display: 'Orange Pi Lite',
    board_name: 'lite'
  }, {
    code: 'opi_lite2',
    display: 'Orange Pi Lite 2',
    board_name: 'lite2'
  }, {
    code: 'opi_one',
    display: 'Orange Pi One',
    board_name: 'one'
  }, {
    code: 'opi_one_plus',
    display: 'Orange Pi One Plus',
    board_name: 'oneplus'
  }, {
    code: 'opi_pc',
    display: 'Orange Pi PC',
    board_name: 'pc'
  }, {
    code: 'opi_pc2',
    display: 'Orange Pi PC2',
    board_name: 'pc2'
  }, {
    code: 'opi_pc_plus',
    display: 'Orange Pi PC Plus',
    board_name: 'pcplus'
  }, {
    code: 'opi_3',
    display: 'Orange Pi 3',
    board_name: '3'
  }, {
    code: 'opi_plus_2e',
    display: 'Orange Pi Plus 2E',
    board_name: 'plus2e'
  }, {
    code: 'opi_prime',
    display: 'Orange Pi Prime',
    board_name: 'prime'
  }, {
    code: 'opi_r1',
    display: 'Orange Pi R1',
    board_name: 'r1'
  }, {
    code: 'opi_win_plus',
    display: 'Orange Pi WinPlus',
    board_name: 'winplus'
  }, {
    code: 'opi_zero',
    display: 'Orange Pi Zero',
    board_name: 'zero'
  }, {
    code: 'opi_zero_plus',
    display: 'Orange Pi Zero Plus',
    board_name: 'zeroplus'
  }, {
    code: 'opi_zero_plus_2',
    display: 'Orange Pi Zero Plus 2',
    board_name: 'zeroplus2'
  }]

exports.readAppConfig = async() => ini_parser('application.ini');