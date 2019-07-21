/* eslint-disable no-undef */

if (typeof window === 'undefined') {
  require('babel-register');
  global.ZionSdk = require('../src/index');
  global.axios = require('axios');
  global.EquatorAxiosClient = ZionSdk.EquatorAxiosClient;
  var chaiAsPromised = require('chai-as-promised');
  global.chai = require('chai');
  global.chai.should();
  global.chai.use(chaiAsPromised);
  global.sinon = require('sinon');
  global.expect = global.chai.expect;
} else {
  window.axios = ZionSdk.axios;
  window.EquatorAxiosClient = ZionSdk.EquatorAxiosClient;
}
