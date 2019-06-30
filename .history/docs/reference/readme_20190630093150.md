---
title: Overview
---
The JavaScript Zion SDK facilitates integration with the [Zion Equator API server](https://github.com/zioncoin2100/equator) and submission of Zion transactions, either on Node.js or in the browser. It has two main uses: [querying Equator](#querying-equator) and [building, signing, and submitting transactions to the Zion network](#building-transactions).

[Building and installing js-zion-sdk](https://github.com/zioncoin2100/js-zion-sdk)<br>
[Examples of using js-zion-sdk](./examples.md)

# Querying Equator
js-zion-sdk gives you access to all the endpoints exposed by Equator.

## Building requests
js-zion-sdk uses the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send
to Equator. Starting with a [server](https://zion.github.io/js-zion-sdk/Server.html) object, you can chain methods together to generate a query.
(See the [Equator reference](http://zionc.info/blog/) documentation for what methods are possible.)
```js
var ZionSdk = require('zion-sdk');
var server = new ZionSdk.Server('https://equator-testnet.zion.org');
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(1400)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Equator.

## Streaming requests
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`.
Equator will start sending responses from either the beginning of time or from the point specified with `.cursor()`.
(See the [Equator reference](http://zionc.info/blog/) documentation to learn which endpoints support streaming.)

For example, to log instances of transactions from a particular account:

```javascript
var ZionSdk = require('zion-sdk')
var server = new ZionSdk.Server('https://equator-testnet.zion.org');
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler
    })
```

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://www.zion.org/developers/equator/learn/xdr.html)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of re-writing the txHandler from above to print the XDR fields as JSON:

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(ZionSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(ZionSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(ZionSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The links returned with the Equator response are converted into functions you can call on the returned object.
This allows you to simply use `.next()` to page through results. It also makes fetching additional info, as in the following example, easy:

```js
server.payments()
    .limit(1)
    .call()
    .then(function(response){
        // will follow the transactions link returned by Equator
        response.records[0].transaction().then(function(txs){
            console.log(txs);
        });
    });
```


# Transactions

## Building transactions

See the [Building Transactions](https://www.zion.org/developers/js-zion-base/learn/building-transactions.html) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can submit it to the Zion network with `Server.submitTransaction()`.
```js
const ZionSdk = require('zion-sdk')
ZionSdk.Network.useTestNetwork();
const server = new ZionSdk.Server('https://equator-testnet.zion.org');

(async function main() {
    const account = await server.loadAccount(publicKey);

    /* 
        Right now, we have one function that fetches the base fee.
        In the future, we'll have functions that are smarter about suggesting fees,
        e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    */
    const fee = await server.fetchBaseFee();

    const transaction = new ZionSdk.TransactionBuilder(account, { fee })
        .addOperation(
            // this operation funds the new account with XLM
            ZionSdk.Operation.payment({
                destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
                asset: ZionSdk.Asset.native(),
                amount: "20000000"
            })
        )
        .setTimeout(30)
        .build();

    // sign the transaction
    transaction.sign(ZionSdk.Keypair.fromSecret(secretString)); 

    try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log(transactionResult);
    } catch (err) {
        console.error(err);
    }
})()
```
