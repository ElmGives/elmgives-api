var signatureRequestMessage = {
      hash: {
        type: 'sha256'
      },
      payload: {
        address: 'wYAAm2TQ8ToXJAUVQFrmZQJR3pnBYcwxuL',
        previous: {
          hash: previous.hash,
          payload: previous.payload,
          signatures: previous.signatures
        },
        transactions: transactionChain
      },
      signatures: []
    };
    signatureRequestMessage.hash.value = crypto.createHash('sha256')
      .update(JSON.stringify(signatureRequestMessage.payload)).digest('hex');
    signatureRequestMessage.signatures.push({
      header: {
        alg: 'ed25519',
        kid: 'wLArAhCz3SAfaQtdd13aPFXHR38MUZiXKg'
      },
      signature: ed25519.sign(signatureRequestMessage.hash.value, '04fc46936ee2d09d6b61f80a12d3e43e3ffd6d7fad5445081758d40aebfc67be', 'hex').toDER('hex')
    });