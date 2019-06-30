---
title: Basic Examples
---

- [Creating a payment Transaction](#creating-a-payment-transaction)
- [Loading an account's transaction history](#loading-an-accounts-transaction-history)
- [Streaming payment events](#streaming-payment-events)

## Creating a payment transaction

js-zion-sdk exposes the class from js-zion-base.  There are more examples of . All those examples can be signed and submitted to Zion in a similar manner as is done below.

In this example, the destination account must exist. The example is written 
using modern Javascript, but `await` calls can also be rendered with promises.

```javascript
// Create, sign, and submit a transaction using JS Zion SDK.

// Assumes that you have the following items:
// 1. Secret key of a funded account to be the source account
// 2. Public key of an existing account as a recipient
//    These two keys can be created and funded by the friendbot at
// 3. Access to JS Zion SDK (https://github.com/zioncoin2100/js-zion-sdk)
//    either through Node.js or in the browser.

// This code can be run in the browser at https://www.zion.org/laboratory/
// That site exposes a global ZionSdk object you can use.
// To run this code in the Chrome, open the console tab in the DevTools.
// The hotkey to open the DevTools console is Ctrl+Shift+J or (Cmd+Opt+J on Mac).
const ZionSdk = require('zion-sdk');

// The source account is the account we will be signing and sending from.
const sourceSecretKey = 'SAKRB7EE6H23EF733WFU76RPIYOPEWVOMBBUXDQYQ3OF4NF6ZY6B6VLW';

// Derive Keypair object and public key (that starts with a G) from the secret
const sourceKeypair = ZionSdk.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

const receiverPublicKey = 'GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D';

// Configure ZionSdk to talk to the equator instance hosted by Zion.org
// To use the live network, set the hostname to 'equator.zion.org'
const server = new ZionSdk.Server('https://equator-testnet.zion.org');

// Uncomment the following line to build transactions for the live network. Be
// sure to also change the equator hostname.
// ZionSdk.Network.usePublicNetwork();
ZionSdk.Network.useTestNetwork();

(async function main() {
  // Transactions require a valid sequence number that is specific to this account.
  // We can fetch the current sequence number for the source account from Equator.
  const account = await server.loadAccount(sourcePublicKey);


  // Right now, there's one function that fetches the base fee.
  // In the future, we'll have functions that are smarter about suggesting fees,
  // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
  const fee = await server.fetchBaseFee();


  const transaction = new ZionSdk.TransactionBuilder(account, { fee })
    // Add a payment operation to the transaction
    .addOperation(ZionSdk.Operation.payment({
      destination: receiverPublicKey,
      // The term native asset refers to lumens
      asset: ZionSdk.Asset.native(),
      // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
      // the decimal. They are represented in JS Zion SDK in string format
      // to avoid errors from the use of the JavaScript Number data structure.
      amount: '350.1234567',
    }))
    // Make this transaction valid for the next 30 seconds only
    .setTimeout(30)
    // .addMemo(ZionSdk.Memo.text('Hello world!'))
    .build();

  // Sign this transaction with the secret key
  // NOTE: signing is transaction is network specific. Test network transactions
  // won't work in the public network. To switch networks, use the Network object
  // as explained above (look for ZionSdk.Network).
  transaction.sign(sourceKeypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  console.log(transaction.toEnvelope().toXDR('base64'));

  // Submit the transaction to the Equator server. The Equator server will then
  // submit the transaction into the network for us.
  try {
    const transactionResult = await server.submitTransaction(transaction);
    console.log(JSON.stringify(transactionResult, null, 2));
    console.log('\nSuccess! View the transaction at: ');
    console.log(transactionResult._links.transaction.href);
  } catch (e) {
    console.log('An error has occured:');
    console.log(e);
  }
})();
```

## Loading an account's transaction history

Let's say you want to look at an account's transaction history.  You can use the `transactions()` command and pass in the account address to `forAccount` as the resource you're interested in.

```javascript
const ZionSdk = require('zion-sdk')
const server = new ZionSdk.Server('https://equator-testnet.zion.org');
const accountId = 'GBBORXCY3PQRRDLJ7G7DWHQBXPCJVFGJ4RGMJQVAX6ORAUH6RWSPP6FM';

server.transactions()
    .forAccount(accountId)
    .call()
    .then(function (page) {
        console.log('Page 1: ');
        console.log(page.records);
        return page.next();
    })
    .then(function (page) {
        console.log('Page 2: ');
        console.log(page.records);
    })
    .catch(function (err) {
        console.log(err);
    });
```

## Streaming payment events

js-zion-sdk provides streaming support for Equator endpoints using `EventSource`.  You can pass a function to handle any events that occur on the stream.

Try submitting a transaction (via the guide above) while running the following code example.
```javascript
const ZionSdk = require('zion-sdk')
const server = new ZionSdk.Server('https://equator-testnet.zion.org');

// Get a message any time a payment occurs. Cursor is set to "now" to be notified
// of payments happening starting from when this script runs (as opposed to from
// the beginning of time).
const es = server.payments()
  .cursor('now')
  .stream({
    onmessage: function (message) {
      console.log(message);
    }
  })
```

For more on streaming events, please check out and this [guide to server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).
