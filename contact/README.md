# Handle contact us from Mobile apps

Single endpoint to handle _email us_ from mobile Apps to Admin

## Responses

- success response

```javascript
{
    data: { email: 'ok!' }
}
```

- fail response

```javascript
{
    message: 'cant process request right now',
    status: 422
}
```

## 1. Contact us

```javascript
// POST /contact

const data = {
    content: '', // content from user input
    category: 'contact', // string representation to identify user action, i.e: suggestion, question...
    contact: '',    // user's email, used to eventually reply
}
```

## 2. Suggest NPO

- request

```javascript
// POST /contact

const data = {
    content: '', // content from user input
    category: 'npo', // string representation to identify user action, i.e: suggestion, question...
    contact: '',    // user's email, used to eventually reply
}
```