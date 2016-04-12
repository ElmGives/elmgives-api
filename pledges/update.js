/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

const NPO = require('../npos/npo');
const Bank = require('../banks/bank');

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

    let npo = NPO.findOne({
        _id: request.body.npoId
    });

    let bank = Bank.findOne({
        _id: request.body.bankId
    });

    let pledge = user.pledges.id(request.params.pledgeId);

    if (!pledge) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity not found';

        return next(error);
    }

    Promise
        .all([npo, bank])
        .then(values => {
            if (!values[0] || !values[1]) {
                let error = new Error();
                error.status = 422;
                error.message = 'Proper fields values requiered';

                return next(error);
            }

            pledge.montlyLimit = request.body.montlyLimit || pledge.montlyLimit;

            pledge.npoId = request.body.npoId || pledge.npoId;
            pledge.bankId = request.body.bankId || pledge.bankId;
            pledge.npo = values[0].name || pledge.npo;
            pledge.bank = values[1].name || pledge.bank;

            request.pledgeId = pledge._id;
            return user.save();
        }, error => {
            return next(error);
        })
        .then(( /*user*/ ) => response.json({
            data: [user.pledges.id(request.pledgeId)]
        }))
        .catch(next);
};
