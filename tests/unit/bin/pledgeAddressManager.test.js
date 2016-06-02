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
let message = {
  userId: mongoose.Types.ObjectId(),
  pledgeId: mongoose.Types.ObjectId(),
  limit: 10,
  nonce: 'nonce'
};
let messages = [message];



tape('Pledge Address Manager methods', test => {
    test.plan(16);

    /* #pollQueue */
    sinon.stub(manager, 'parsePledgeAddressRequests').returns(P.resolve(messages));
    sinon.stub(manager, 'handlePledgeAddressRequest').returns(Promise.resolve());
    sinon.stub(manager, 'requestWalletAddress').returns(Promise.resolve([]));
    manager.pollQueue(queue, params)
        .then(() => {
            test.deepEqual(queue.receiveMessage.getCall(0).args[0],
                params, 'receiveMessage is called with a parameters object');
            test.deepEqual(manager.parsePledgeAddressRequests.getCall(0).args[0] instanceof Array,
                true, 'parsePledgeAddressRequests is called with an array of messages');
            test.deepEqual(manager.handlePledgeAddressRequest.getCall(0).args[0],
                messages[0], 'handlePledgeAddressRequest is called with a message');
        })
        .then(() => {
            manager.parsePledgeAddressRequests.restore();
            messages[0] = {Body: JSON.stringify(message)};
            messages.push({Body:'{}'}); // empty JSON
            messages.push({Body:'{:}'}); // bad JSON
            messages.push({Body:'{"userId":"1", "pledgeId": "2", "limit": 10}'}); // missing properties
            return manager.parsePledgeAddressRequests(messages);
        })
        .then(messages => {
            delete messages[0].amazonWebServicesHandle;
            test.equal(messages[0].userId, String(message.userId), 'message userId is present');
            test.equal(messages[0].pledgeId, String(message.pledgeId), 'message pledgeId is present');
            test.equal(messages[0].limit, message.limit, 'message limit is present');
            test.equal(messages[0].nonce, message.nonce, 'message nonce is present');
            test.equal(messages[1], undefined, 'ignores empty JSON messages');
            test.equal(messages[2], undefined, 'ignores badly formatted JSON');
            test.equal(messages[3], undefined, 'ignores on missing properties');
        })
        .then(() => {
            manager.handlePledgeAddressRequest.restore();
            let user = {name: 'john', lastName: 'doe'};
            manager.models.user = {
                findOne: sinon.stub().returns(P.resolve(user))
            };
            return manager.handlePledgeAddressRequest(message, queue, params);
        })
        .then(() => {
            test.equal(manager.models.user.findOne.calledOnce, true, 'the User model is queried');
            test.equal(manager.requestWalletAddress.calledOnce, true, '#requestWalletAddress was called');
            test.equal(manager.requestWalletAddress.getCall(0).args[1], message.pledgeId, '#requestWalletAddress was called with the pledgeId');
            test.equal(manager.requestWalletAddress.getCall(0).args[2], message.nonce, '#requestWalletAddress was called with the nonce');
            test.equal(queue.deleteMessage.calledOnce, true, 'queue#deleteMessage was called');
            test.deepEqual(queue.deleteMessage.getCall(0).args[1], params, '#deleteMessage was called with params');
        });
});