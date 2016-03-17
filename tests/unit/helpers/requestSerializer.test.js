'use strict';

let tape = require('tape');
let requestSerializer = require('../../../helpers/requestSerializer');

tape('Request Serializer helper', test => {
    test.plan(2);

    let request = {
        method: 'get',
        url: '/summer-time'
    };

    let result = requestSerializer(request);

    test.equal(result.method, 'get', 'should return proper method');
    test.equal(result.url, '/summer-time', 'should return proper url');
});
