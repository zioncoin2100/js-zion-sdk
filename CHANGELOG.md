# Changelog

As this project is pre 1.0, breaking changes may happen for minor version bumps.
A breaking change will get clearly marked in this log.

## [v1.0.2](https://github.com/zioncoin2100/js-zion-sdk/compare/v1.0.1...v1.0.2)

- Upgrade zion-base to v1.0.2 to fix a bug with the browser bundle.

## [v1.0.1](https://github.com/zioncoin2100/js-zion-sdk/compare/v1.0.0...v1.0.1)

- Upgrade zion-base to v1.0.1, which makes available again the deprecated
  operation functions `Operation.manageOffer` and `Operation.createPassiveOffer`
  (with a warning).
- Fix the documentation around timebounds.

## [v1.0.0](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.15.4...v1.0.0)

- Upgrade zion-base to
  [v1.0.0](https://github.com/zioncoin2100/js-zion-base/releases/tag/v1.0.0),
  which introduces two breaking changes.
- Switch zion-sdk's versioning to true semver! 🎉

## [v0.15.4](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.15.3...v0.15.4)

- Add types for LedgerCallBuilder.ledger.
- Add types for Server.operationFeeStats.
- Add types for the EquatorAxiosClient export.
- Move @types/\* from devDependencies to dependencies.
- Pass and use a stream response type to CallBuilders if it's different from the
  normal call response.
- Upgrade zion-base to a version that includes types, and remove
  @types/zion-base as a result.

## [v0.15.3](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.15.2...v0.15.3)

- In .travis.yml, try to switch from the encrypted API key to an environment
  var.

## [v0.15.2](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.15.1...v0.15.2)

- Fix Server.transactions and Server.payments definitions to properly return
  collections
- Renew the npm publish key

## [v0.15.1](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.15.0...v0.15.1)

- Add Typescript type definitions (imported from DefinitelyTyped).
- Make these changes to those definitions:
  - Add definitions for Server.fetchBaseFee and Server.fetchTimebounds
  - CallBuilder: No long always returns CollectionPaged results. Interfaces that
    extend CallBuilder should specify whether their response is a collection or
    not
  - CallBuilder: Add inflation_destination and last_modified_ledger property
  - OfferRecord: Fix the returned properties
  - TradeRecord: Fix the returned properties
  - TradesCallBuilder: Add forAccount method
  - TransactionCallBuilder: Add includeFailed method
  - Equator.BalanceLineNative/Asset: Add buying_liabilities /
    selling_liabilities properties
- Fix documentation links.

## [v0.15.0](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.14.0...v0.15.0)

- **Breaking change**: `zion-sdk` no longer ships with an `EventSource`
  polyfill. If you plan to support IE11 / Edge, please use
  [`event-source-polyfill`](https://www.npmjs.com/package/event-source-polyfill)
  to set `window.EventSource`.
- Upgrade `zion-base` to a version that doesn't use the `crypto` library,
  fixing a bug with Angular 6
- Add `Server.prototype.fetchTimebounds`, a helper function that helps you set
  the `timebounds` property when initting `TransactionBuilder`. It bases the
  timebounds on server time rather than local time.

## [v0.14.0](https://github.com/zioncoin2100/js-zion-sdk/compare/v0.13.0...v0.14.0)

- Updated some out-of-date dependencies
- Update documentation to explicitly set fees
- Add `Server.prototype.fetchBaseFee`, which devs can use to fetch the current
  base fee; we plan to add more functions to help suggest fees in future
  releases
- Add `includeFailed` to `OperationCallBuilder` for including failed
  transactions in calls
- Add `operationFeeStats` to `Server` for the new fee stats endpoint
- After submitting a transaction with a `manageOffer` operation, return a new
  property `offerResults`, which explains what happened to the offer. See
  [`Server.prototype.submitTransaction`](https://zion.github.io/js-zion-sdk/Server.html#submitTransaction)
  for documentation.

## 0.13.0

- Update `zion-base` to `0.11.0`
- Added ESLint and Prettier to enforce code style
- Upgraded dependencies, including Babel to 6
- Bump local node version to 6.14.0

## 0.12.0

- Update `zion-base` to `0.10.0`:
  - **Breaking change** Added
    [`TransactionBuilder.setTimeout`](https://zion.github.io/js-zion-base/TransactionBuilder.html#setTimeout)
    method that sets `timebounds.max_time` on a transaction. Because of the
    distributed nature of the Zion network it is possible that the status of
    your transaction will be determined after a long time if the network is
    highly congested. If you want to be sure to receive the status of the
    transaction within a given period you should set the TimeBounds with
    `maxTime` on the transaction (this is what `setTimeout` does internally; if
    there's `minTime` set but no `maxTime` it will be added). Call to
    `TransactionBuilder.setTimeout` is required if Transaction does not have
    `max_time` set. If you don't want to set timeout, use `TimeoutInfinite`. In
    general you should set `TimeoutInfinite` only in smart contracts. Please
    check
    [`TransactionBuilder.setTimeout`](https://zion.github.io/js-zion-base/TransactionBuilder.html#setTimeout)
    docs for more information.
  - Fixed decoding empty `homeDomain`.
- Add `offset` parameter to TradeAggregationCallBuilder to reflect new changes
  to the endpoint in equator-0.15.0

## 0.11.0

- Update `js-xdr` (by updating `zion-base`) to support unmarshaling non-utf8
  strings.
- String fields returned by `Operation.fromXDRObject()` are of type `Buffer` now
  (except `SetOptions.home_domain` and `ManageData.name` - both required to be
  ASCII by zion-core).

## 0.10.3

- Update `zion-base` and xdr files.

## 0.10.2

- Update `zion-base` (and `js-xdr`).

## 0.10.1

- Update `zion-base` to `0.8.1`.

## 0.10.0

- Update `zion-base` to `0.8.0` with `bump_sequence` support.

## 0.9.2

- Removed `.babelrc` file from the NPM package.

## 0.9.1

### Breaking changes

- `zion-sdk` is now using native `Promise` instead of `bluebird`. The `catch`
  function is different. Instead of:

  ```js
  .catch(ZionSdk.NotFoundError, function (err) { /* ... */ })
  ```

  please use the following snippet:

  ```js
  .catch(function (err) {
    if (err instanceof ZionSdk.NotFoundError) { /* ... */ }
  })
  ```

- We no longer support IE 11, Firefox < 42, Chrome < 49.

### Changes

- Fixed `_ is undefined` bug.
- Browser build is around 130 KB smaller!

## 0.8.2

- Added `timeout` option to `StellarTomlResolver` and `FederationServer` calls
  (https://github.com/zioncoin2100/js-zion-sdk/issues/158).
- Fixed adding random value to URLs multiple times
  (https://github.com/zioncoin2100/js-zion-sdk/issues/169).
- Fixed jsdoc for classes that extend `CallBuilder`.
- Updated dependencies.
- Added `yarn.lock` file to repository.

## 0.8.1

- Add an allowed trade aggregation resolution of one minute
- Various bug fixes
- Improved documentation

## 0.8.0

- Modify `/trades` endpoint to reflect changes in equator.
- Add `/trade_aggregations` support.
- Add `/assets` support.

## 0.7.3

- Upgrade `zion-base`.

## 0.7.2

- Allow hex string in setOptions signers.

## 0.7.1

- Upgrade `zion-base`.

## 0.7.0

- Support for new signer types: `sha256Hash`, `preAuthTx`.
- `StrKey` helper class with `strkey` encoding related methods.
- Removed deprecated methods: `Keypair.isValidPublicKey` (use `StrKey`),
  `Keypair.isValidSecretKey` (use `StrKey`), `Keypair.fromSeed`, `Keypair.seed`,
  `Keypair.rawSeed`.
- **Breaking changes**:
  - `Network` must be explicitly selected. Previously testnet was a default
    network.
  - `Operation.setOptions()` method `signer` param changed.
  - `Keypair.fromAccountId()` renamed to `Keypair.fromPublicKey()`.
  - `Keypair.accountId()` renamed to `Keypair.publicKey()`.
  - Dropping support for `End-of-Life` node versions.

## 0.6.2

- Updated `zion.toml` location

## 0.6.1

- `forUpdate` methods of call builders now accept strings and numbers.
- Create a copy of attribute in a response if there is a link with the same name
  (ex. `transaction.ledger`, `transaction._links.ledger`).

## 0.6.0

- **Breaking change** `CallBuilder.stream` now reconnects when no data was
  received for a long time. This is to prevent permanent disconnects (more in:
  [#76](https://github.com/zioncoin2100/js-zion-sdk/pull/76)). Also, this method
  now returns `close` callback instead of `EventSource` object.
- **Breaking change** `Server.loadAccount` now returns the `AccountResponse`
  object.
- **Breaking change** Upgraded `zion-base` to `0.6.0`. `ed25519` package is
  now an optional dependency. Check `ZionSdk.FastSigning` variable to check
  if `ed25519` package is available. More in README file.
- New `StellarTomlResolver` class that allows getting `zion.toml` file for a
  domain.
- New `Config` class to set global config values.

## 0.5.1

- Fixed XDR decoding issue when using firefox

## 0.5.0

- **Breaking change** `Server` and `FederationServer` constructors no longer
  accept object in `serverUrl` parameter.
- **Breaking change** Removed `AccountCallBuilder.address` method. Use
  `AccountCallBuilder.accountId` instead.
- **Breaking change** It's no longer possible to connect to insecure server in
  `Server` or `FederationServer` unless `allowHttp` flag in `opts` is set.
- Updated dependencies.

## 0.4.3

- Updated dependency (`zion-base`).

## 0.4.2

- Updated dependencies.
- Added tests.
- Added `CHANGELOG.md` file.

## 0.4.1

- `zion-base` bump. (c90c68f)

## 0.4.0

- **Breaking change** Bumped `zion-base` to
  [0.5.0](https://github.com/zioncoin2100/js-zion-base/blob/master/CHANGELOG.md#050).
  (b810aef)
