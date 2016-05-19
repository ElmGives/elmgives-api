/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

const Charity = require('./pledge');
const NPO = require('../npos/npo');
const Bank = require('../banks/bank');
const aws = require('../lib/awsQueue');
const logger = require('../logger');
const getYearMonth = require('../lib/getYearMonth');

module.exports = (request, response, next) => {
    const userId = request.body.userId + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;
    let npo = NPO.findOne({
        _id: request.body.npoId
    });
    let bank = Bank.findOne({
        _id: request.body.bankId
    });

    let exist = user.pledges.some(item => {
        return item.npoId + '' === request.body.npoId &&
            item.bankId + '' === request.body.bankId;
    });
    let active = user.pledges.find(item => item.active);

    if (exist) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity already exist';

        return next(error);
    }

    Promise
        .all([npo, bank])
        .then(values => {
            if (!values[0] || !values[1]) {
                let error = new Error();
                error.status = 422;
                error.message = 'Proper fields values required';

                return next(error);
            }

            let pledge = {
                monthlyLimit: request.body.monthlyLimit,
                npoId: request.body.npoId,
                bankId: request.body.bankId,
                npo: values[0].name,
                bank: values[1].name,
                userId: request.session.userId
            };

            return new Charity(pledge);
        }, error => {
            return next(error);
        })
        .then(pledge => {
            /* Transfer latest active address to the new pledge */
            if (typeof active === 'object') {
                active.active = false;

                let currentYearMonth = getYearMonth();
                let dateQuery = `addresses.${currentYearMonth}`;
                let currentAddress = active.addresses[currentYearMonth];

                if (currentAddress) {
                    pledge.set(dateQuery, currentAddress);
                    active.set(dateQuery, undefined);
                }
            }
            /* Activate and add new pledge to the current user */
            pledge.active = true;
            user.pledges.unshift(pledge);
            request.pledgeId = pledge._id;
            return user.save();
        })
        .then(( /*user*/ ) => response.json({
            data: [user.pledges.id(request.pledgeId)]
        }))
        .then(() => {
            /* Request a new address only if no pledge was previously active */
            if (typeof active === 'object') {return;}
            aws.sendMessage({
                userId: userId,
                pledgeId: String(request.pledgeId),
                limit: request.body.monthlyLimit,
                nonce: String((new Date()).getTime())
            }, {
                queue: process.env.AWS_SQS_URL_ADDRESS_REQUESTS
            })
            .catch(error => {
                logger.error(error);
            });
        })
        .catch(next);
};
