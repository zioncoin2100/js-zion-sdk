// eslint-disable-next-line prefer-import/prefer-import-over-require
require('es6-promise').polyfill();

// zion-sdk classes to expose
export * from './errors';
export { Config } from './config';
export { Server } from './server';
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE
} from './federation_server';
export {
  StellarTomlResolver,
  STELLAR_TOML_MAX_SIZE
} from './zion_toml_resolver';
export { default as HorizonAxiosClient } from './equator_axios_client';

// expose classes and functions from zion-base
export * from 'zion-base';

export default module.exports;
