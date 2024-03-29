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

# # # install nodejs via nvm
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# installing specific node version
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

# install pm2 process management
sudo mkdir -p ~/logs
sudo chmod 777 logs
cd ~/webapp
npm install
sudo npm install pm2@latest -g
sudo pm2 startup
sudo pm2 start ecosystem.config.js
sudo pm2 save

sudo apt-get install wget -y


# codedeploy steps
sudo apt install ruby-full -y

# installation of codedeploy
cd /home/ubuntu
wget https://aws-codedeploy-$CURRENTREGION.s3.$CURRENTREGION.amazonaws.com/latest/install
chmod +x ./install
# install latest agent
sudo ./install auto
# sudo service codedeploy-agent start
sudo service codedeploy-agent status

# install cloudwatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/home/ubuntu/webapp/amazon-cloudwatch-config.json

