/**
 * Return proper object for validations errors
 */
'use strict';

module.exports = (error) => {
    let errors = error.errors || {};
    let data = {};
    Object.keys(errors).map(field => data[field] = errors[field].message);
    return data;
};
