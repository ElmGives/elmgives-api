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

var charities = {
    'name': 'Charities',
    'description': '<p> Manage NPOs associated to an user</p>',

    'calls': {
        'list': {
            'params': {
                userId: 'string',
                'auth_token': 'string'
            },
            'url': API + '/users/[userId]/charities',
            'urlWithId': 'userId',
            'wrapper': '',
            'method': 'GET'
        },
        'add new one': {
            'description': 'Associate NPOs, banks with current user.',
            'params': {
                userId: 'string',
                bankId: 'string',
                npoId: 'string',
                montlyLimit: 'number'
            },
            'url': API + '/users/[userId]/charities',
            'urlWithId': 'userId',
            'wrapper': '',
            'method': 'POST'
        },
        'single charity': {
            'description': 'Get single Charity information',
            'params': {
                'auth_token': 'string',
                'userId': 'string',
                'charityId': 'string'
            },
            'url': API + '/users/[userId]/charities/[charityId]',
            'urlWithId': ['userId', 'charityId'],
            'method': 'GET'
        },
        'update charity': {
            'description': 'update charity',
            'params': {
                'auth_token': 'string',
                userId: 'string',
                charityId: 'string',
                bankId: 'string',
                npoId: 'string',
                montlyLimit: 'number'
            },
            'url': API + '/users/[userId]/charities/[charityId]',
            'urlWithId': ['userId', 'charityId'],
            'method': 'PUT'
        },
        'remove charity': {
            'description': 'removes charity associated to current user.',
            'params': {
                'auth_token': 'string',
                userId: 'string',
                charityId: 'string'
            },
            'url': API + '/users/[userId]/charities/[charityId]',
            'urlWithId': ['userId', 'charityId'],
            'wrapper': '',
            'method': 'DELETE'
        }
    }
};

var banks = {
    'name': 'Banks',
    'description': '<p> Manage banks.</p>',

    'calls': {
        'bank list': {
            'description': 'Banks registered.',
            'params': {
                'auth_token': 'string'
            },
            'url': API + '/banks',
            'method': 'GET'
        },
        'single bank': {
            'description': 'Shows the given user info.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/banks/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new bank': {
            'description': 'Posts a Bank.',
            'params': {
                'auth_token': 'string',
                'name': 'string',
                'description': 'string',
                'logoUrl': 'string',
                'email': 'string',
                'zip': 'string',
                'phone': 'string'
            },
            'url': API + '/banks',
            'wrapper': '',
            'method': 'POST'
        },
        'update bank': {
            'description': 'Updates an Bank.',
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
            'url': API + '/banks/[id]',
            'urlWithId': 'id',
            'wrapper': '',
            'method': 'PUT'
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
        },
        'delete session': {
            'description': 'Removes a session.',
            'params': {
                'id': 'string'
            },
            'url': API + '/sessions/[id]',
            'wrapper': '',
            'method': 'DELETE',
            callback: function(response) {
                localStorage.removeItem('cu');
            }
        }
    }
};

define([], function() {
    'use strict';

    var services = {
        users: users,
        sessions: sessions,
        banks: banks,
        npos: npos,
        charities: charities
    };

    return {
        services: services
    };
});
