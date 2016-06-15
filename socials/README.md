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
2. Validate `token` from social login with facebook against Facebook API
3. If token is invalid, return error, otherwise, find Social with provided information
4. If social not found, create social and user. Then move to next step
5. Looks for *User* model instance where `email` matches provided data
6. Create a session and return content to APP.
