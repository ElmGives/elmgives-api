# Posts

Content associated to **N**on **P**rofit **O**rganization ( NPO )

### Create a Post

Authenticated **POST** request to `/posts`

body:

```
npoId: VALID_NPO_ID
images: [{source: '', order: 1}]
videos: [{source: '', order: 1, shareUrl: ''}]
```

### Get posts

Authenticated **GET** request to `/posts`

### Get post's dashboard

Authenticated **GET** request to `/posts?dashboard=true`

### Get post's for NPO

Authenticated **GET** request to `/posts?npoId=VALID_NPO_ID`

### Update a Post

Authenticated **PUT** request to `/posts/VALID_NPO_ID`

body:

```
images: [{source: '', order: 1}]
images: [{source: '', order: 1, shareUrl: ''}]
```

### Remove a Post

Authenticated **DELETE** request to `/posts/VALID_NPO_ID`
