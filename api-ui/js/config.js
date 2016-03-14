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

var npos = {
    'name': 'NPOs',
    'description': '<p> Manage npos.</p>',

    'calls': {
        'npo list': {
            'description': 'NPOs registered.',
            'params': {
                'auth_token': 'string'
            },
            'url': API + '/npos',
            'method': 'GET'
        },
        'single npo': {
            'description': 'Shows the given user info.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/npos/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new npo': {
            'description': 'Posts a NPO.',
            'params': {
                'auth_token': 'string',
                'name': 'string',
                'description': 'string',
                'logoUrl': 'string',
                'email': 'string',
                'zip': 'string',
                'phone': 'string'
            },
            'url': API + '/npos',
            'wrapper': '',
            'method': 'POST'
        },
        'update npo': {
            'description': 'Updates an NPO.',
            'params': {
                'id': 'string',
                'auth_token': 'string',
                'name': 'string',
                'description': 'string',
                'logoUrl': 'string',
                'email': 'string',
                'zip': 'string',
                'phone': 'string'
            },
            'url': API + '/npos/[id]',
            'urlWithId': 'id',
            'wrapper': '',
            'method': 'PUT'
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
        users: users,
        npos: npos
    };

    return {
        services: services
    };
});
