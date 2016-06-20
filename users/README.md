### Recovery password

We agree on sent a recovery code with four digits code.

#### Flow

1. request change password: receives a code via email
2. request change password with code: receives a token
3. request change password with token: changes password


- User request a new password

```
POST /users

body: changePassword = myemail@foobar.com
```

- API will send an email with four digits code to the provided email
only if there's an user with that email.


- Once user enters this code, application should POST that code to `/users`
with the following body:

```
POST /users

changePassword = myemail@foobar.com
code = PROVIDED_CODE_FROM_USER_INPUT
```

- API will validate code against provided email and return, if no errors, a
one time token. Then user will `POST /users`

```
POST /users

changePassword = myemail@foobar.com
token = -token from previous request-
email = myemail@foobar.com
```

- API will validate authenticity of the token, will update password and return
success default response

- From that, user should be able to use new password.
