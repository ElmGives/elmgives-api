# Environment Variables

## Misc
SEND_ERRORS=
### URL of the web/client app for Email Verification and others
CLIENT_URL='http://localhost:3000'

## Slack for Slack notifications
SLACK_TOKEN=''
SLACK_ENABLED=true

## Authentication
EXPIRE_HOURS=8
JWT_SECRET='supersecretvalue'

## Database
DB_USER=''
DB_PASS=''
DB_HOST='localhost'
DB_PORT=27017
DB_NAME='elm-api'

## Plaid
PLAID_CLIENTID='test_id'
PLAID_SECRET='test_secret'
PLAID_ENV='https://tartan.plaid.com'

## AWS SQS
AWS_SQS_REGION='us-west-1'
AWS_SQS_ACCESS='accessKeyId'
AWS_SQS_SECRET='secretAccessKey'
AWS_SQS_URL_TO_SIGNER='https://sqs.region.amazonaws.com/account/queue'
AWS_SQS_URL_FROM_SIGNER='https://sqs.region.amazonaws.com/account/queue'

## AWS S3
AWS_S3_KEY=
AWS_S3_SECRET=
AWS_S3_REGION=
AWS_S3_ACL='public-read'

## Mandrill
### These templates are named Mandrill templates, see Mandrill account
MANDRILL_API_KEY='MANDRILL_API_KEY'
MANDRILL_EMAIL_SENDER='danny@elmgives.com' - Email all outbound emails come from
MANDRILL_ADMIN_EMAIL=''  -  Email Contact Us emails are sent to
MANDRILL_VERIFY_ACCOUNT_EMAIL_TEMPLATE=''
MANDRILL_RECOVERY_PASSWORD_EMAIL_TEMPLATE=''
MANDRILL_CONTACT_US_EMAIL_TEMPLATE=''

## Signing Server
SERVER_KID = 'uuid'
SERVER_PRIVATE_KEY='private_key'
SIGNER_URL='http://remotehost:3000'
SIGNER_PUBLIC_KEY=''

## Stripe
STRIPE_SECRET_KEY='sk_live_...'



