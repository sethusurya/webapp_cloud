# webapp

** Built using _Node v16.15.1_ **

###### SETUP AND RUNNING INSTRUCTIONS

1. Install NodeJS version 16 or greater
2. clone the repository into local
3. Install dependencies after navigating into cloned repository using
   > npm install
4. Start the server by using
   > npm start
5. Open postman and navigate to url
   > http://localhost:3000/healthz
   
###### INSTRUCTIONS FOR ASSIGNMENT 2 and later

1. Install Postgres in local computer
2. Access postgres as root user
   > psql -U postgres
3. Enter the password you have set while installing postgres
4. Create new role and give it permission to create db
   > CREATE ROLE me WITH LOGIN PASSWORD 'password';
   > ALTER ROLE me CREATEDB;
5. check available roles by
   > \du
6. Connect with role me
   > psql -d postgres -U me
7. Create database api
   > CREATE DATABASE api
8. Connect to api
   > \c api
9. Create table accounts - for storing users
   ```
   CREATE TABLE accounts (
      id VARCHAR(255),
      first_name VARCHAR(30),
      last_name VARCHAR(30),
	   password VARCHAR(255),
	   username VARCHAR(255),
	   account_created VARCHAR(255),
	   account_updated VARCHAR(255)
      );
   ```
10. Install dependencies
    > yarn install
11. Run
    > yarn start