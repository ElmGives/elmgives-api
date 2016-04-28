'use strict';

const P = require('bluebird');
const tape = require('tape');
const sinon = require('sinon');
const manager = require('../../../bin/pledgeAddressManager');
const mongoose = require('mongoose');

let queue = {
    getQueueAttributes: sinon.stub().returns(
        Promise.resolve({ApproximateNumberOfMessages: 1})
    ),
    receiveMessage: sinon.stub().returns(Promise.resolve([{Body:'{}'}])),
    deleteMessage: sinon.stub().returns(Promise.resolve())
};
let params = {
    queue: 'QueueUrl'
};
let messages = [{
  userId: mongoose.Types.ObjectId(),
  pledgeId: mongoose.Types.ObjectId(),
  limit: 10,
  nonce: 'nonce'
}];



tape.only('Pledge Address Manager methods', test => {
    test.plan(3);

    /* #pollQueue */
    sinon.stub(manager, 'parsePledgeAddressRequests').returns(P.resolve(messages));
    sinon.stub(manager, 'handlePledgeAddressRequest').returns(Promise.resolve());
    manager.pollQueue(queue, params)
        .then(() => {
            test.deepEqual(queue.receiveMessage.getCall(0).args[0],
                params, 'receiveMessage is called with a parameters object');
            test.deepEqual(manager.parsePledgeAddressRequests.getCall(0).args[0] instanceof Array,
                true, 'parsePledgeAddressRequests is called with an array of messages');
            test.deepEqual(manager.handlePledgeAddressRequest.getCall(0).args[0],
                messages[0], 'handlePledgeAddressRequest is called with a message');
        });

    /* #parsePledgeAddressRequests */
    
    /* #handlePledgeAddressRequest */

});