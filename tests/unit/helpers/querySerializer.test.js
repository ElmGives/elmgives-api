'use strict';

let tape = require('tape');
let querySerializer = require('../../../helpers/querySerializer');

tape('Query Serializer helper', test => {
    test.plan(1);

    let data = {
        coll: 'rabits',
        method: 'find',
        query: {
            color: 'white'
        },
        doc: {},
        options: {}
    };

    let expected = `db.rabits.find({"color":"white"}, {});`;
    let actual = querySerializer(data);

    test.equal(expected, actual, 'should serialize query from object');
});
