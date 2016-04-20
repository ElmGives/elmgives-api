#!/usr/bin/env bash

ssh elmgives@stage-admin.elmgives.com << EOF

  cd /home/elmgives/apps/elmgives-api

  git checkout develop
  git reset --hard
  git pull

  npm install --production
  pm2 restart all
EOF
