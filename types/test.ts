import * as ZionSdk from 'zion-sdk';

ZionSdk.StellarTomlResolver.resolve('example.com', {
  allowHttp: true,
  timeout: 100
}).then((toml: any) => toml.FEDERATION_SERVER);
