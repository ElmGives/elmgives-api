### Delete Account.

1. We can't just delete data because it will cause a lot of issues.
2. We can't archive because user may want to create a new account again with same information
3. Move user information to another 'non real' user.

```
DELETE /users/:id
```

API will move user@elm.com to something like user[ramdon string here]@elm.com with this way we can manage some background processes to deal with charges.

#### Tasks on delete account

- [ ] Change email (for our convenience)
- [ ] set `archived` to true
- [ ] set any pledge `active` = false
- [ ] remove any pending charge
- [ ] remove any reference to any queque

### Recovey password

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
