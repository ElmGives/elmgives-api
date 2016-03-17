'use strict';

module.exports = function unique(fields, tree, test) {
    fields.map(field => {
        let actual = tree[field].unique;
        test.equal(true, actual, field + ' should be unique');
    });
};
