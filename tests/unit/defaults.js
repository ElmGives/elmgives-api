'use strict';

module.exports = function types(fields, tree, test, value) {
    fields.map(field => {
        let expected = value;
        let actual = tree[field].default;
        test.equal(expected, actual, field + ' should be ' + value);
    });
};
