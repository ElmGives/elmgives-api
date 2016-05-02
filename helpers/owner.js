/**
 * Validate if current user id matches request user id
 */

'use strict';

module.exports = (userId, id) => {
    return !!userId && !!id && (userId + '') === (id + '');
};
