var API = 'http://localhost:3000';

var schools = {
    'name': 'Shools',
    'description': '<p> Manage schools.</p>',

    'calls': {
        'list': {
            'description': 'Shools registered.',
            'params': {
                'auth_token': 'string'
            },
            'url': API + '/schools',
            'method': 'GET'
        },
        'single school': {
            'description': 'Shows the given user info.',
            'params': {
                'auth_token': 'string',
                'id': 'integer'
            },
            'url': API + '/schools/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new school': {
            'description': 'Posts a school.',
            'params': {
                'auth_token': 'string',
                'title': 'string',
                'location': 'string',
                'description': 'string',
                'enabled': 'boolean',
            },
            'url': API + '/schools',
            'wrapper': '',
            'method': 'POST'
        },
        'update school': {
            'description': 'Updates an user.',
            'params': {
                'auth_token': 'string',
                'id': 'integer',
                'title': 'string',
                'description': 'string',
                'location': 'string',
                'enabled': 'boolean',
            },
            'url': API + '/schools/[id]',
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
        sessions: sessions
    };

    return {
        services: services
    };
});
