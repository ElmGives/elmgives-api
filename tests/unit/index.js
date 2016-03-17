'use strict';

module.exports = function index(fields, tree, test) {
    fields.map(field => {
        let actual = tree[field].index;
        test.equal(true, actual, field + ' should be have index');
    });
};
