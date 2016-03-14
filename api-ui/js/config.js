var API = 'http://localhost:3000';

var users = {
    'name': 'Users',
    'description': '<p> Manage users.</p>',

    'calls': {
        'create new user': {
            'description': 'Posts a user.',
            'params': {
                name: 'string',
                firstName: 'string',
                lastName: 'string',
                password: 'string',
                email: 'string'
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        }
    }
};

var sessions = {
    'name': 'Sessions',
    'description': '<p> Manage sessions.</p>',
    calls: {
        'create new session': {
            'description': 'Posts a session.',
            'params': {
                'email': 'string',
                'password': 'string',
            },
            'url': API + '/sessions',
            'wrapper': '',
            'method': 'POST',
            callback: function(response) {
                localStorage.setItem('cu', JSON.stringify(response));
            }
        }
    }
};

define([], function() {
    'use strict';

    var services = {
        sessions: sessions,
        users: users
    };

    return {
        services: services
    };
});
