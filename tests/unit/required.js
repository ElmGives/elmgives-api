'use strict';

module.exports = function required(fields, errors, test) {
    fields.map(field => {
        let expected = 'Path `' + field + '` is required.';
        let actual = errors[field].message;
        test.equal(expected, actual, field + ' should be required');
    });
};
