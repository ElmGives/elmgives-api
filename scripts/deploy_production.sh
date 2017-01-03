#!/usr/bin/env bash

ssh elmgives@api.elmgives.com << EOF

  cd /home/elmgives/apps/elmgives-api

  git checkout master
  git reset --hard
  git pull

  npm install --production
  pm2 restart all
EOF
