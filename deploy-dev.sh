#!/bin/bash

cp ../config/tomoissuer.json ./config/local.json

pm2 list || npm i -g pm2
pm2 startOrReload pm2.config.js