/**
 * Seed database with default values, for development purposes
 */
'use strict';

require('../app');
const Role = require('../roles/role');
const User = require('../users/user');
let roles = require('./roles.json');
const query = {
    email: 'homer@elm.com'
};

let findOrInsert = (data) => {

    const query = {
        title: data.title
    };

    return Role
        .findOne(query)
        .then(role => role ? role : new Role(data).save());
};

function all(promises) {
    Promise
        .all(promises)
        .then(values => {
            values.map(role => console.log(`role found/created ${role.title}`));
            Role
                .findOne({
                    title: 'admin'
                })
                .then(role => {
                    console.log(role);
                    return User.update({
                        email: {
                            $in: ['homer@elm.com', 'brice@elm.com', 'daniel@elm.com']
                        }
                    }, {
                        $set: {
                            roleId: role._id
                        }
                    }, {
                        multi: true
                    });
                })
                .then(updated => {
                    console.log('updated', updated);
                    process.exit(0);
                })
                .catch(error => {
                    console.log('error on updating roles', error);
                    process.exit(1);
                });
        }, reason => {
            console.log(reason);
            process.exit(1);
        });
}

User
    .findOne(query)
    .then(user => {

        let updated = roles.map(role => {
            role.userId = user._id;
            return role;
        });

        let promises = updated.map(role => findOrInsert(role));
        all(promises);
    });
