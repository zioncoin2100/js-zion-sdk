# js-zion-sdk

[![Build Status](https://travis-ci.com/zion/js-zion-sdk.svg?branch=master)](https://travis-ci.com/zion/js-zion-sdk)
[![Coverage Status](https://coveralls.io/repos/zion/js-zion-sdk/badge.svg?branch=master&service=github)](https://coveralls.io/github/zion/js-zion-sdk?branch=master)
[![Dependency Status](https://david-dm.org/zion/js-zion-sdk.svg)](https://david-dm.org/zion/js-zion-sdk)

js-zion-sdk is a Javascript library for communicating with a
[Zion Equator server](https://github.com/zioncoin2100/go/tree/master/services/equator).
It is used for building Zion apps either on Node.js or in the browser.

It provides:

- a networking layer API for Equator endpoints.
- facilities for building and signing transactions, for communicating with a
  Zion Equator instance, and for submitting transactions or querying network
  history.

### zion-sdk vs zion-base

zion-sdk is a high-level library that serves as client-side API for Equator.
[zion-base](https://github.com/zioncoin2100/js-zion-base) is lower-level
library for creating Zion primitive constructs via XDR helpers and wrappers.

**Most people will want zion-sdk instead of zion-base.** You should only
use zion-base if you know what you're doing!

If you add zion-sdk to a project, **do not add zion-base!** Mis-matching
versions could cause weird, hard-to-find bugs. zion-sdk automatically
installs zion-base and exposes all of its exports in case you need them.

> **Warning!** Node version of `zion-base` (`zion-sdk` dependency) package
> is using [`ed25519`](https://www.npmjs.com/package/ed25519) package, a native
> implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as an
> [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies).
> This means that if for any reason installation of this package fails,
> `zion-base` (and `zion-sdk`) will fallback to the much slower
> implementation contained in
> [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `zion-sdk`/`zion-base` in a browser you can ignore
> this. However, for production backend deployments you should definitely be
> using `ed25519`. If `ed25519` is successfully installed and working
> `ZionSdk.FastSigning` variable will be equal `true`. Otherwise it will be
> `false`.

## Quick start

Using npm to include js-zion-sdk in your own project:

```shell
npm install --save zion-sdk
```

For browsers,
[use Bower to install js-zion-sdk](#to-self-host-for-use-in-the-browser). It
exports a variable `ZionSdk`. The example below assumes you have
`zion-sdk.js` relative to your html file.

```html
<script src="zion-sdk.js"></script>
<script>
  console.log(ZionSdk);
</script>
```

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save zion-sdk
```

2. require/import it in your JavaScript:

```js
var ZionSdk = require('zion-sdk');
```

#### Help! I'm having trouble installing the SDK on Windows

Unfortunately, the Zion platform development team mostly works on OS X and
Linux, and so sometimes bugs creep through that are specific to windows. When
installing zion-sdk on windows, you might see an error that looks similar to
the following:

```shell
error MSB8020: The build tools for v120 (Platform Toolset = 'v120 ') cannot be found. To build using the v120 build tools, please install v120 build tools.  Alternatively, you may upgrade to the current Visual Studio tools by selecting the Project menu or right-click the solution, and then selecting "Retarget solution"
```

To resolve this issue, you should upgrade your version of nodejs, node-gyp and
then re-attempt to install the offending package using
`npm install -g --msvs_version=2015 ed25519`. Afterwards, retry installing
zion-sdk as normal.

If you encounter the error: "failed to find C:\OpenSSL-Win64", You need to
install OpenSSL. More information about this issue can be found
[here](https://github.com/nodejs/node-gyp/wiki/Linking-to-OpenSSL).

In the event the above does not work, please join us on our community slack to
get help resolving your issue.

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install zion-sdk
```

2. Include it in the browser:

```html
<script src="./bower_components/zion-sdk/zion-sdk.js"></script>
<script>
  console.log(ZionSdk);
</script>
```

If you don't want to use install Bower, you can copy built JS files from the
[bower-js-zion-sdk repo](https://github.com/zioncoin2100/bower-js-zion-sdk).

### To use the [cdnjs](https://cdnjs.com/libraries/zion-sdk) hosted script in the browser

1. Instruct the browser to fetch the library from
   [cdnjs](https://cdnjs.com/libraries/zion-sdk), a 3rd party service that
   hosts js libraries:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/zion-sdk/{version}/zion-sdk.js"></script>
<script>
  console.log(ZionSdk);
</script>
```

Note that this method relies using a third party to host the JS library. This
may not be entirely secure.

Make sure that you are using the latest version number. They can be found on the
[releases page in Github](https://github.com/zioncoin2100/js-zion-sdk/releases).

### To develop and test js-zion-sdk itself

1. Clone the repo:

```shell
git clone https://github.com/zioncoin2100/js-zion-sdk.git
```

2. Install dependencies inside js-zion-sdk folder:

```shell
cd js-zion-sdk
npm install
```

3. Install Node 6.14.0

Because we support earlier versions of Node, please install and develop on Node
6.14.0 so you don't get surprised when your code works locally but breaks in CI.

Here's out to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 6.14.0 before you'll want to re-install yarn
npm install -g yarn
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

````

4. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
   linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
````

If you're working on a file not in `src`, limit your code to Node 6.16 ES! See
what's supported here: https://node.green/ (The reason is that our npm library
must support earlier versions of Node, so the tests need to run on those
versions.)

## Usage

For information on how to use js-zion-sdk, take a look at the
[Developers site](https://www.zion.org/developers/js-zion-sdk/reference/).

There is also API Documentation
[here](http://zionc.info/blog/).

## Testing

To run all tests:

```shell
gulp test
```

To run a specific set of tests:

```shell
gulp test:node
gulp test:browser
```

To generate and check the documentation site:

```shell
# install the `serve` command if you don't have it already
npm install -g serve

# generate the docs files
npm run docs

# get these files working in a browser
cd jsdoc && serve .

# you'll be able to browse the docs at http://localhost:5000
```

## Documentation

Documentation for this repo lives in
[Developers site](https://www.zion.org/developers/js-zion-sdk/learn/index.html).

## Contributing

For information on how to contribute, please refer to our
[contribution guide](https://github.com/zioncoin2100/js-zion-sdk/blob/master/CONTRIBUTING.md).

## Publishing to npm

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required. Read more about
[npm version](https://docs.npmjs.com/cli/version).

## License

js-zion-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/zioncoin2100/js-zion-sdk/blob/master/LICENSE) file
for details.
