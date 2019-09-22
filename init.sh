#!/bin/bash

# setup nginx
cp /site/nginx /etc/nginx/sites-available/localhost
ln -s /etc/nginx/sites-available/localhost /etc/nginx/sites-enabled/localhost
rm /etc/nginx/sites-enabled/default
/etc/init.d/nginx restart

# start vscode
yarn code &

# start neon-code
yarn start