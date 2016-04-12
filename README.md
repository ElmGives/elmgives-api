# elmgives-api

Node.js backend
<br /><br />
## Environment Setup

#### Hard dependencies

- nodejs v5.7.0+
- mongodb 3.x


#### Update dependencies

To update / upgrade dependencies just run:

```
npm run update
```

and follow instructions. We are using `npm-check` package


#### 1. About env variables

Copy `.env.example` to `.env` and set proper values for each env variable

#### 2. NPM Dependencies

In order to install the npm dependencies for the project, run the command:

```
npm install
```

#### 3. Seed (Only for development)
After `npm install` it's needed to seed the database with data, this process will create default:

`users`, `banks` and `npos`. Run the command:


```
npm run seed
```


## Server

#### Development
```
npm start
```

#### Production
Besides the app server (pm2 recommended), you have 2 option:

1. set `NODE_ENV=production` and `npm install`
2. or run `npm install --production`

Then run:

```
npm start-production
```

Note: You should include proper env variables to your environment.

===

## API UI <small> (endpoint documentation) </small>

```
npm run ui
```

Then open your browser http://localhost:3002


## Unit Tests

```
npm test
```

### Emails

We are using [Mandrill](https://mandrillapp.com/api/docs/messages.nodejs.html)
In order to send and email,

1. Create a template on Mandrill web site
2. Require `email/mandrill` file and provide required values to `send` method

```javascript
const email = require('./email/mandrill');

// Third param is optional and it's related to global merge variables used with
// Mandrill API
email.send('templateName', [{email: 'my email'}], [{name: '', content: ''}])
```

## Folder structure

```
.
├── app.js
├── banks
│   ├── bank.js
│   └── index.js
├── bin
│   └── www
├── config
│   └── database.js
├── documentation
│   └── SCHEMAS.md
├── .editorconfig
├── .env.example
├── .gitignore
├── helpers
│   ├── comparePassword.js
│   ├── emailValidator.js
│   ├── expire.js
│   ├── jwt.js
│   ├── notFound.js
│   ├── querySerializer.js
│   ├── requestSerializer.js
│   ├── token.js
│   ├── validateUrl.js
│   └── validationErrors.js
├── .jshintrc
├── lib
│   ├── archive.js
│   ├── create.js
│   ├── error.js
│   ├── fourOhFour.js
│   ├── list.js
│   ├── logRequest.js
│   ├── sendError.js
│   ├── show.js
│   ├── success.js
│   └── update.js
├── logger.js
├── logs
│   ├── error.log
│   └── .gitkeep
├── modules.js
├── npos
│   ├── index.js
│   └── npo.js
├── package.json
├── README.md
├── sessions
│   ├── create.js
│   ├── index.js
│   └── session.js
├── tests
│   ├── defaults.js
│   ├── helpers
│   │   ├── comparePassword.test.js
│   │   ├── emailValidator.test.js
│   │   ├── expire.test.js
│   │   ├── jwt.test.js
│   │   ├── querySerializer.test.js
│   │   ├── requestSerializer.test.js
│   │   ├── token.test.js
│   │   ├── validateUrl.test.js
│   │   └── validationErrors.test.js
│   ├── models
│   │   ├── bank.test.js
│   │   ├── npo.test.js
│   │   ├── session.test.js
│   │   └── user.test.js
│   ├── required.js
│   └── types.js
└── users
    ├── create.js
    ├── index.js
    └── user.js
```

