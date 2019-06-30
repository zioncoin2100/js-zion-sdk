const http = require('http');

describe('zion_toml_resolver.js tests', function() {
  beforeEach(function() {
    this.axiosMock = sinon.mock(axios);
    ZionSdk.Config.setDefault();
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('StellarTomlResolver.resolve', function() {
    afterEach(function() {
      ZionSdk.Config.setDefault();
    });

    it('returns zion.toml object for valid request and zion.toml file', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/zion.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve zion addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.zion.org/federation"
`
          })
        );

      ZionSdk.StellarTomlResolver.resolve('acme.com').then((zionToml) => {
        expect(zionToml.FEDERATION_SERVER).equals(
          'https://api.zion.org/federation'
        );
        done();
      });
    });

    it('returns zion.toml object for valid request and zion.toml file when allowHttp is `true`', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/zion.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve zion addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.zion.org/federation"
`
          })
        );

      ZionSdk.StellarTomlResolver.resolve('acme.com', {
        allowHttp: true
      }).then((zionToml) => {
        expect(zionToml.FEDERATION_SERVER).equals(
          'http://api.zion.org/federation'
        );
        done();
      });
    });

    it('returns zion.toml object for valid request and zion.toml file when global Config.allowHttp flag is set', function(done) {
      ZionSdk.Config.setAllowHttp(true);

      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/zion.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve zion addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.zion.org/federation"
`
          })
        );

      ZionSdk.StellarTomlResolver.resolve('acme.com').then((zionToml) => {
        expect(zionToml.FEDERATION_SERVER).equals(
          'http://api.zion.org/federation'
        );
        done();
      });
    });

    it('rejects when zion.toml file is invalid', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/zion.toml'))
        .returns(
          Promise.resolve({
            data: `
/#   The endpoint which clients should query to resolve zion addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.zion.org/federation"
`
          })
        );

      ZionSdk.StellarTomlResolver.resolve('acme.com')
        .should.be.rejectedWith(/Parsing error on line/)
        .and.notify(done);
    });

    it('rejects when there was a connection error', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/zion.toml'))
        .returns(Promise.reject());

      ZionSdk.StellarTomlResolver.resolve(
        'acme.com'
      ).should.be.rejected.and.notify(done);
    });

    it('fails when response exceeds the limit', function(done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }
      var response = Array(ZionSdk.STELLAR_TOML_MAX_SIZE + 10).join('a');
      let tempServer = http
        .createServer((req, res) => {
          res.setHeader('Content-Type', 'text/x-toml; charset=UTF-8');
          res.end(response);
        })
        .listen(4444, () => {
          ZionSdk.StellarTomlResolver.resolve('localhost:4444', {
            allowHttp: true
          })
            .should.be.rejectedWith(
              /zion.toml file exceeds allowed size of [0-9]+/
            )
            .notify(done)
            .then(() => tempServer.close());
        });
    });

    it('rejects after given timeout when global Config.timeout flag is set', function(done) {
      ZionSdk.Config.setTimeout(1000);

      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          ZionSdk.StellarTomlResolver.resolve('localhost:4444', {
            allowHttp: true
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => {
              ZionSdk.Config.setDefault();
              tempServer.close();
            });
        });
    });

    it('rejects after given timeout when timeout specified in StellarTomlResolver opts param', function(done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          ZionSdk.StellarTomlResolver.resolve('localhost:4444', {
            allowHttp: true,
            timeout: 1000
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => tempServer.close());
        });
    });
  });
});
