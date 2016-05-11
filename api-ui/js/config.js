var API = 'http://localhost:3000';

var users = {
    'name': 'Users',
    'description': '<p> Manage users.</p>',

    'calls': {
        'user list': {
            'description': 'Users registered.',
            'params': {
                'auth_token': 'string'
            },
            'url': API + '/users',
            'method': 'GET'
        },
        'single user': {
            'description': 'Single user information.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/users/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new user': {
            'description': 'Posts a user.',
            'params': {
                name: 'string',
                password: 'string',
                email: 'string',
                roleId: 'string ( valid mongo id from Role )'
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        },
        'update user': {
            'description': 'Updates user owned by current  user or any user from admin.',
            'params': {
                'id': 'string',
                'auth_token': 'string',
                name: 'string',
                phone: 'string',
                zip: 'string'
            },
            'url': API + '/users/[id]',
            'urlWithId': 'id',
            'wrapper': '',
            'method': 'PUT'
        },
        'delete user': {
            'description': 'Removes an user.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/users/[id]',
            'urlWithId': 'id',
            'wrapper': '',
            'method': 'DELETE'
        },
        'verify account': {
            'description': 'Verify account',
            'params': {
                verificationToken: 'string',
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        },
        'request password change': {
            'description': 'Ask API for a token to change password',
            'params': {
                changePassword: 'string ( email ) ',
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        },
        'request new password': {
            'description': 'Ask API token to change password',
            'params': {
                changePassword: 'string(email)',
                code: 'string ( four digits code )'
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        },
        'change password': {
            'description': 'Ask API for password change',
            'params': {
                changePassword: 'string(email)',
                token: 'string ( big token )',
                password: 'string ( new password )'
            },
            'url': API + '/users',
            'wrapper': '',
            'method': 'POST'
        }
    }
};

var pledges = {
    'name': 'Pledges',
    'description': '<p> Manage NPOs associated to an user</p>',

    'calls': {
        'list': {
            'params': {
                userId: 'string',
                'auth_token': 'string'
            },
            'url': API + '/users/[userId]/pledges',
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
            'url': API + '/users/[userId]/pledges',
            'urlWithId': 'userId',
            'wrapper': '',
            'method': 'POST'
        },
        'single pledge': {
            'description': 'Get single Pledge information',
            'params': {
                'auth_token': 'string',
                'userId': 'string',
                'pledgeId': 'string'
            },
            'url': API + '/users/[userId]/pledges/[pledgeId]',
            'urlWithId': ['userId', 'pledgeId'],
            'method': 'GET'
        },
        'update pledge': {
            'description': 'update pledge',
            'params': {
                'auth_token': 'string',
                userId: 'string',
                pledgeId: 'string',
                bankId: 'string',
                npoId: 'string',
                montlyLimit: 'number'
            },
            'url': API + '/users/[userId]/pledges/[pledgeId]',
            'urlWithId': ['userId', 'pledgeId'],
            'method': 'PUT'
        },
        'remove pledge': {
            'description': 'removes pledge associated to current user.',
            'params': {
                'auth_token': 'string',
                userId: 'string',
                pledgeId: 'string'
            },
            'url': API + '/users/[userId]/pledges/[pledgeId]',
            'urlWithId': ['userId', 'pledgeId'],
            'wrapper': '',
            'method': 'DELETE'
        }
    }
};

var posts = {
    'name': 'Posts',
    'description': '<p> Manage posts.</p>',

    'calls': {
        'post list': {
            'description': 'Posts registered.',
            'params': {
                'auth_token': 'string',
                'npoId': 'string',
                dashboard: 'boolean'
            },
            'url': API + '/posts',
            'method': 'GET'
        },
        'single post': {
            'description': 'Shows the given user info.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/posts/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new post': {
            'description': 'Posts a Bank.',
            'params': {
                'auth_token': 'string',
                'npoId': 'string',
                'images': 'string',
                'videos': 'string',
                node: 'string',
                'textContent': 'string'
            },
            'url': API + '/posts',
            'wrapper': '',
            'method': 'POST'
        },
        'update post': {
            'description': 'Updates an Bank.',
            'params': {
                'id': 'string',
                'auth_token': 'string',
                'npoId': 'string',
                'images': 'string',
                'videos': 'string',
                'textContent': 'string'
            },
            'url': API + '/posts/[id]',
            'urlWithId': 'id',
            'wrapper': '',
            'method': 'PUT'
        },
        'remove post': {
            'description': 'removes a post.',
            'params': {
                'auth_token': 'string',
                'id': 'string'
            },
            'url': API + '/posts/[id]',
            'urlWithId': 'id',
            'method': 'DELETE'
        },
    }
};

var roles = {
    'name': 'Roles',
    'description': '<p> Manage roles.</p>',

    'calls': {
        'role list': {
            'description': 'roles registered.',
            'params': {
                'auth_token': 'string',
            },
            'url': API + '/roles',
            'method': 'GET'
        },
    }
};

var images = {
    'name': 'Images',
    'description': '<p> Manage posts.</p>',

    'calls': {
        'upload image': {
            'description': '',
            'params': {
                'auth_token': 'string',
                'logos': 'file'
            },
            'url': API + '/images',
            'wrapper': '',
            hasFile: true,
            'method': 'POST'
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
                'auth_token': 'string',
                'sort': 'string ( comma separated fields )',
                'fields': 'string ( comma separated NPOs fields )'
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
                'auth_token': 'string',
                'sort': 'string ( comma separated fields )',
                'page': 'number',
                'fields': 'string ( comma separated NPOs fields )'
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
                'backgroundColor': 'string',
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
                var data = response.data || [];
                localStorage.setItem('cu', JSON.stringify(data));
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
        posts: posts,
        roles: roles,
        images: images,
        pledges: pledges
    };

    return {
        services: services
    };
});
