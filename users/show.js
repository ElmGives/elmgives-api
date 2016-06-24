/**
 * Middleware to get single User information
 */
'use strict';

const User = require('./user');
const Bank = require('../banks/bank');

module.exports = function show(request, response, next) {
    if (!request.params.id) {
        return response.status(422).json({
            error: 'required params missing'
        });
    }

    let query = {
        _id: request.params.id
    };

    return User
        .findOne(query)
        .then(found => {
            if (!found) {
                let error = new Error();
                error.status = 404;
                error.message = 'Resource not found';
                return next(error);
            }

            found.password = undefined;
            found.stripe = undefined;

            let pledge = request.currentUser.pledges.find(item => item.active);
            if (pledge && pledge.bankId) {
                return Bank.findOne({_id: pledge.bankId})
                    .then(bank => {
                        if (bank && bank.type) {
                            found.plaid = {
                                accounts: found.plaid.accounts[bank.type]
                            };
                        } else {
                            found.plaid = undefined;
                        }

                        return found;
                    });
            }

            found.plaid = undefined;
            return found;
        })
        .then(found => {
            /**
             * As per requirements we should return everything associated to the
             * user, except password (it's a hash)
             */
            let result = {
                data: found
            };

            if(found.roleId){
                result.data.roleId = found.roleId;
            }

            return response.json(result);
        })
        .catch(next);
};
