'use strict';

/**
 * Gets user active pledge
 * @param   {Object[]}  pledges
 * @param   {String}    userId
 * @returns {Object}
 */
function getActivePledge(pledges, userId) {
    console.assert(Array.isArray(pledges), 'pledges must be an Array', pledges);
    console.assert(typeof userId === 'string', 'userId must be a String', userId);

    let activePledge = pledges.filter(pledge => pledge.active);

    if (activePledge.length === 0) {
        let error = new Error('active-pledge-not-found');
        error.status = 404;
        error.details = `User with ID ${userId} has no active pledge`;
        throw error;
    }

    return activePledge[0];
}

module.exports = getActivePledge;
