### Recovey password

We agree on sent a recovery token with four digits code.

#### Flow

- User request a new password

```
POST /users

body: requestPassword = myemail@foobar.com
```

- API will send an email with four digits code to the provided email
only if there's an user with that email.

- Once user enters this code, application should POST that code to `/users`
with the following body:

```
resetPassword = myemail@foobar.com
code = PROVIDED_CODE_FROM_USER_INPUT
password = NEW_PASSWORD_FROM_USER_INPUT
```

- API will validate authenticity of the code and will return success default response to the user and change the password.

- From that, user should be able to use new password.