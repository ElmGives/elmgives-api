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

Copy `.env.example` to `.env` and set proper values for each env variable. We introduce a helper
to validate required environment variables. You should include yours on `./scripts/requiredVariables.js`

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

### API responses

Based on jsonapi.org

- success response

Should use 2xx status code

```javascript
{
    data: [ /* array of objects here */],
    meta: {
        total: 1, /* count of available resources based on query */
        // other fields to be defined like pagination ones
    }
}
```

- Single object response:

```javascript
{
    data: {} // single object associated to `data` field
}
```


- PUT/DELETE request's response:

```javascript
{
    data: {} //empty object here
}
```

- Error responses for validation

Should use 4xx status code

```
{
    errors: [ /* array of objects here, only available for validation errors */],
    message: ' error from server'
    status: 422, /* status code for the response, same as status code header */
}
```

- Error responses

Should use 4xx status code

```
{
    message: ' error from server'
    status: 422, /* status code for the response, same as status code header */
}
```

## Pagination

```
GET /resource?
```

#### 1. return some fields

```
GET /resource?fields=field1,field2
```

#### 2. sort by some field or fields

Sort **ascending** just use the field, to sort **descending** use **-**field

```
GET /resource?sort=field1,-field2
```

#### 3. return results for a page

```
GET /resource?page=2
```

#### 4. return more results per page(up to 50 by default)

```
GET /resource?perPage=30
```

#### 5. Combine as you need:

```
GET /resource?fields=-field1,field2&sort=field1&perPage=30
```

## Folder structure

```
.
.
├── addresses
│   ├── address.js
│   ├── create.js
│   ├── read.js
│   └── update.js
├── banks
│   ├── bank.js
│   └── index.js
├── bin
│   ├── pledgeAddressManager.js
│   ├── roundup.js
│   └── www
├── config
│   └── database.js
├── db
│   ├── addresses.js
│   ├── addresses.json
│   ├── banks.js
│   ├── banks.json
│   ├── npos.js
│   ├── npos.json
│   ├── roles.js
│   ├── roles.json
│   ├── transactions.js
│   ├── transactions.json
│   ├── users.js
│   └── users.json
├── documentation
│   └── SCHEMAS.md
├── email
│   ├── mandrill.js
│   └── mandrill_test.js
├── helpers
│   ├── admin.js
│   ├── arraySort.js
│   ├── comparePassword.js
│   ├── defaultResponse.js
│   ├── emailValidator.js
│   ├── expire.js
│   ├── hashPassword.js
│   ├── jwt.js
│   ├── notFound.js
│   ├── owner.js
│   ├── padNumber.js
│   ├── plaidTransactionFilter.js
│   ├── querySerializer.js
│   ├── requestSerializer.js
│   ├── roundup.js
│   ├── token.js
│   ├── transactionChain.js
│   ├── validateUrl.js
│   ├── validationErrors.js
│   ├── validMedia.js
│   ├── validSession.js
│   ├── verificationCode.js
│   ├── verifyJwsSignature.js
│   └── verifyToken.js
├── images
│   ├── create.js
│   ├── index.js
│   └── upload.js
├── lib
│   ├── archive.js
│   ├── authenticate.js
│   ├── awsQueue.js
│   ├── create.js
│   ├── currentUser.js
│   ├── customMiddlewares.js
│   ├── error.js
│   ├── fourOhFour.js
│   ├── isAdmin.js
│   ├── list.js
│   ├── logRequest.js
│   ├── notAllowed.js
│   ├── sendError.js
│   ├── show.js
│   ├── success.js
│   ├── update.js
│   └── verifyJwt.js
├── logs
├── npos
│   ├── index.js
│   └── npo.js
├── plaid
│   ├── connect
│   │   ├── add.js
│   │   ├── delete.js
│   │   ├── get.js
│   │   ├── index.js
│   │   ├── patch.js
│   │   └── step.js
│   ├── institutions
│   │   └── index.js
│   ├── link
│   │   ├── exchange.js
│   │   └── index.js
│   └── index.js
├── pledges
│   ├── create.js
│   ├── index.js
│   ├── list.js
│   ├── pledge.js
│   ├── remove.js
│   ├── schema.js
│   ├── single.js
│   ├── transactionHistory.js
│   └── update.js
├── posts
│   ├── create.js
│   ├── index.js
│   ├── list.js
│   ├── post.js
│   ├── remove.js
│   └── update.js
├── roles
│   └── role.js
├── roundup
│   ├── cluster.js
│   ├── getFromAws.js
│   ├── roundAndSendToAwsQueue.js
│   ├── supervisor.js
│   └── worker.js
├── scripts
│   ├── deploy_staging.sh
│   └── requiredVariables.js
├── sessions
│   ├── create.js
│   ├── index.js
│   ├── remove.js
│   └── session.js
├── tests
│   ├── acceptance
│   │   ├── index.js
│   │   └── pledgeAddressManager.test.js
│   └── unit
│       ├── bin
│       │   └── pledgeAddressManager.test.js
│       ├── helpers
│       │   ├── comparePassword.test.js
│       │   ├── emailValidator.test.js
│       │   ├── expire.test.js
│       │   ├── jwt.test.js
│       │   ├── owner.test.js
│       │   ├── padNumber.js
│       │   ├── plaidTransactionFilter.js
│       │   ├── querySerializer.test.js
│       │   ├── requestSerializer.test.js
│       │   ├── roundup.js
│       │   ├── token.test.js
│       │   ├── transactionChain.test.js
│       │   ├── validateUrl.test.js
│       │   ├── validationErrors.test.js
│       │   ├── validMedia.test.js
│       │   ├── validSession.test.js
│       │   └── verificationCode.test.js
│       ├── models
│       │   ├── address.test.js
│       │   ├── bank.test.js
│       │   ├── npo.test.js
│       │   ├── pledge.test.js
│       │   ├── post.test.js
│       │   ├── recoveryCode.test.js
│       │   ├── role.test.js
│       │   ├── session.test.js
│       │   ├── transaction.test.js
│       │   └── user.test.js
│       ├── routes
│       │   ├── banks.test.js
│       │   ├── npos.test.js
│       │   ├── plaid.test.js
│       │   ├── pledges.test.js
│       │   ├── posts.test.js
│       │   ├── sessions.test.js
│       │   └── transactions.test.js
│       ├── defaults.js
│       ├── index.js
│       ├── required.js
│       ├── types.js
│       └── unique.js
├── transactions
│   ├── chain
│   │   ├── create.js
│   │   ├── read.js
│   │   ├── transaction.js
│   │   └── update.js
│   ├── create.js
│   └── plaidTransaction.js
├── users
│   ├── adminOrOwner.js
│   ├── create.js
│   ├── index.js
│   ├── list.js
│   ├── passwordCode.js
│   ├── passwordToken.js
│   ├── README.md
│   ├── recoveryCode.js
│   ├── remove.js
│   ├── resetPassword.js
│   ├── show.js
│   ├── update.js
│   ├── user.js
│   └── validateAccount.js
├── app.js
├── circle.yml
├── logger.js
├── modules.js
├── package.json
└── README.md
```

