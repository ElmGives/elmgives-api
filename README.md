# elmgives-api

Node.js backend

## Dependencies

### Hard dependencies

- nodejs v5.7.0+
- mongodb 3.x

### Development dependencies

```
npm install
```

## Development server

```
npm start
```

## Unit Tests

```
npm test
```

## About env variables

Copy `.env.example` to `.env` and set proper values for each env variable

## Update dependencies

To update / upgrade dependencies just run:

```
npm run update
```

and follow instructions. We are using `npm-check` package

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