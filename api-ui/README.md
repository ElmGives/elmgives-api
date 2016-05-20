## API's UI

Simple UI to test API's endpoints

## Run

```
python -m SimpleHTTPServer
```

then open browser on http://localhost:8000

To add new endpoints:

Edit `js/config.js` and create new entry like this:

```
'packages': {
    'name': 'Packages',
    'description': '<p> Manage packages.</p>',

    'calls': {
        'list': {
            'description': 'Packages registered.',
            'params': {
                'auth_token': 'string'
            },
            'url': API + '/packages',
            'method': 'GET'
        },
        'single package': {
            'description': 'Shows the given user info.',
            'params': {
                'auth_token': 'string',
                'id': 'integer'
            },
            'url': API + '/packages/[id]',
            'urlWithId': 'id',
            'method': 'GET'
        },
        'create new package': {
            'description': 'Posts a package.',
            'params': {
                'auth_token': 'string',
                'title': 'string',
                'description': 'string',
                'price': 'float',
            },
            'url': API + '/packages',
            'wrapper': 'package',
            'method': 'POST'
        }
    }
}
```