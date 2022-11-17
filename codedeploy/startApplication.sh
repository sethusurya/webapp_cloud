echo "After install"
pwd
ls -al
"echo In /home/ubuntu"
cd /home/ubuntu
echo "In webservice"
cd webapp
echo "npm install dependencies"
npm install
echo "Start application"
pwd
ls -al
echo "Start webapp and reload"
# start cloudwatch agent
pm2 restart/reload ecosystem.config.js --update-env
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/home/ubuntu/webapp/amazon-cloudwatch-config.json