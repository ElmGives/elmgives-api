Authenticate users from Social providers(FB) with our API.

1. User will tap facebook login button
2. App will receive facebook information:
    - profile info
    - email
    - token
    - user identifier
3. Post social information to our API

```javascript

// POST /socials with following data

const data = {
    profile: {},
    token: 'string',
    providerId: 'user identifier',
    token: 'token from facebook'
};
```

API steps:

1. Handle **POST** request to `/socials`
2. Looks for *Social* model instance where `token` and `providerId` equals provided data
3. Create a sessiona and return content to APP.
4. If there's no information, means user is about to be created.
5. Create an user based on social information:
    - email
    - token
