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

    let charity = user.charities.id(request.params.charityId);

    if (!charity) {
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

            charity.montlyLimit = request.body.montlyLimit || charity.montlyLimit;

            charity.npoId = request.body.npoId || charity.npoId;
            charity.bankId = request.body.bankId || charity.bankId;
            charity.npo = values[0].name || charity.npo;
            charity.bank = values[1].name || charity.bank;

            request.charityId = charity._id;
            return user.save();
        }, error => {
            return next(error);
        })
        .then(( /*user*/ ) => response.json({
            data: [user.charities.id(request.charityId)]
        }))
        .catch(next);
};
