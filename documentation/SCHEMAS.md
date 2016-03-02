## About...

- amounts, roundups, charges and every currency values

  Since there are many issues with currencies, the best way to
  work with them is to use cents. So, we specified Number as
  field type but it will use cent representation for the values.

  [source](http://stackoverflow.com/questions/11541939/mongodb-what-about-decimal-type-of-value),   [stripe zero-decimal](https://support.stripe.com/questions/which-zero-decimal-currencies-does-stripe-support)

- email length [source](http://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address)

  Email length accepted for IETF is 254

- Field types [source](http://mongoosejs.com/docs/schematypes.html)

  ```js
    String
    Number
    Boolean
    Array
    Buffer
    Date
    ObjectId
    Mixed
  ```

- ENUM

	We can use a new property or an array of string values.

## users

```js
name            String(255)
firstName       String(255)
lastName        String(255)
email           String(254)
password        String
phone           String(255)
address         Mixed
    city        String(255)
    state       String(255)
zip             String(255)
stripeId*       String
cardBrand*      String
cardLastFour*   String(4)
createdAt       Date
updatedAt       Date
banks           Mixed(Array ids)
npos(userNpos)  Mixed(Array Mixed)
    npoId           Objectid
    bankId          Objectid
    montlyLimit(c)  Number
    active          Boolean
    archived				Boolean
```

## banks
```js
name            String(255)
description     String
logoUrl         String
email           String(254)
phone           String(255)
archived				Boolean
active					Boolean
address         Mixed
    city        String(255)
    state       String(255)
updatedAt       Date
updatedAt       Date
```

## transactions

```js
bankId          Objectid
userId          Objectid
npoId           Objectid
stripeChargeId* String
description     String
amount          Number
roundup         Number
status          Mixed(ENUM) | String with defined value
createdAt       Date
updatedAt       Date
```

## npos

```js
name            String(255)
description     String
logoUrl         String
email           String(254)
phone           String(255)
adress          Mixed ( Array )
  city          String(255)
  state         String(255)
archived        Boolean
active          Boolean
zip             String
createdAt       Date
updatedAt       Date
```

## posts

```js
npoId           Objectid
userId          Objectid
title           String(255)
content         String
active          Boolean
archived        Boolean
createdAt       Date
updatedAt       Date
```

## refunds

```js
userId          Objectid
stripeChargeId* String
transaction*    Mixed
amount          Number
status          Mixed(ENUM) | String defined
updatedAt       Date
createdAt       Date
```

## charges

```js
userId          Objectid
stripeId*       String
transaction*    Mixed
amount          Number
amountRefunded* Number
status          Mixed(ENUM) | String defined
createdAt       Date
updatedAt       Date
```
