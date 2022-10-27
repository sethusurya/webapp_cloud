#!/bin/sh

echo "Assignment 4"

# # Update packages
sudo apt-get update
sudo apt-get upgrade -y

# # installing postgresql
# sudo apt install postgresql -y

# # Creating database called api
# sudo -u postgres psql -c "CREATE DATABASE api;"

# giving permission because of permission errors
sudo chmod 755 /home/ubuntu

# # change password for postgres user for allowing application to connect
# sudo -u postgres psql -c "ALTER USER postgres with PASSWORD 'password';"

# # install nodejs via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# installing specific node version
nvm install 16.18.0

# install pm2 process management
cd ~/webapp
npm install
npm install pm2@latest -g
pm2 start server.js
pm2 startup systemd
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v16.18.0/bin /home/ubuntu/.nvm/versions/node/v16.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
