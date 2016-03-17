'use strict';

module.exports = function types(fields, values, test, type) {
    fields.map(field => {
        let expected = type;
        let actual = values[field].instance;
        test.equal(expected, actual, field + ' should be ' + type);
    });
};
