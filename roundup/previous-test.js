var previous = new Transaction({
  hash: {type: "sha256", value: "558debc7c47e9c949b92213c5867520287ae42e5abfcf7b76ee72a42ae29531c"},
    payload: {
      count: 0,
      address: "wYAAm2TQ8ToXJAUVQFrmZQJR3pnBYcwxuL",
      amount: 0,
      roundup: 0,
      balance: 0,
      currency: "USD",
      limit: -10,
      previous: null,
      timestamp: 'Sat Apr 09 2016 08:14:07 GMT-0500 (COT)',
      reference: "plaid_transaction_id"
    },
  signatures: []
});
previous.hash.value = require('crypto').createHash('sha256')
  .update(JSON.stringify(previous.payload, chain.transactionSchemaOrder)).digest('hex');
previous.signatures.push({
  header: {
    alg: 'ed25519',
    kid: 'wYAAm2TQ8ToXJAUVQFrmZQJR3pnBYcwxuL'    
  },
  signature: '30440220011e2e5ead4b2ae50cf7c1c9fcb1a8f091d6ed30d666c6ceea0de295997a03320220061fd3f1614eecdf985fe9b18a733f86adb35318bbbdd38d17be5ae102c687ff'
});
