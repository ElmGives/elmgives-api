/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

const Bank = require('../banks/bank');
const getYearMonth = require('../helpers/getYearMonth');
const objectId = require('mongoose').Types.ObjectId;

module.exports = function update(request, response, next) {
    const userId = request.params.id + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;
    let pledge = user.pledges.id(request.params.pledgeId);
    let active = user.pledges.find(item => item.active);

    if (!pledge) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity not found';
        return next(error);
    }
    if (request.body.active === true && !pledge.active) {
        pledge.active = true;
        if (typeof active === 'object') {
            active.active = false;

            let currentYearMonth = getYearMonth(new Date());
            let dateQuery = `addresses.${currentYearMonth}`;
            let currentAddress = active.addresses[currentYearMonth];

            if (currentAddress) {
                pledge.set(dateQuery, currentAddress);
                active.set(dateQuery, undefined);
            }
        }
    }

    /* Updatas to pledge properties */
    // (changes to monthlyLimit will be reflected in the next month)
    pledge.monthlyLimit = request.body.monthlyLimit || pledge.monthlyLimit;

    checkAndUpdateBankId(pledge, request.body.bankId)
        .then(() => {
            return user.save();
        })
        .then(( /*user*/ ) => response.json({
            data: [pledge]
        }))
        .catch(next);
};

function checkAndUpdateBankId(pledge, bankId) {
    if (!bankId) {
        return Promise.resolve();
    }

    let bankObjectId;
    let error = new Error();
    error.message = 'invalid-bank-id';

    try {
        bankObjectId = objectId(bankId);
    } catch (e) {
        return Promise.reject({error});
    }

    return Bank.findOne({_id: bankObjectId})
        .then(bank => {
            pledge.bankId = bank._id;
            pledge.bank = bank.name;
        })
        .catch(() => Promise.reject({error}));
}
