const { v4: uuid } = require("uuid");
const DEF = require("../definition")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const moment = require("moment-timezone");
const { pool } = require("../queries");
const { authenticate } = require("../middleware.js");


const getUserAccountById = (req, res) => {
 const { user } = req;
 const { accountId } = req.params;
 if (user.id == accountId) {
     pool.query('select * from accounts where id=$1',[accountId], (error, results) => {
        if (error) {
          return res.sendStatus(400)
        }
    
        let finalData = {}
        if (results.rowCount == 1) {
            finalData = results.rows[0]
            delete finalData.password;
        }
        return res.send(finalData);
      })
 } else {
    return res.sendStatus(403);
 }
};

const postUserAccountById = (req, res) => {
    const { body } = req
        if (body && body.first_name && body.last_name && body.username && body.password) {
            // check if the username already exists
            pool.query('select * from accounts where username=$1',[body.username], async (error, results) => {
                if (error) {
                  return res.sendStatus(400)
                }
                if (results.rowCount > 0 ) { // rowCount would be greater than 0 if users existed with same username
                    return res.status(400).send("User already exists!");
                }

                // no user existed, so we create new user
                const password = await bcrypt.hash(body.password, saltRounds);
                const currentTime = moment().toISOString();
                const {username} = body;
                const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
                const isValidUsername = emailRegex.test(username);
                if (!isValidUsername) return res.status(400).send("Invalid Username")
                const newUser = {
                    id: uuid(),
                    ...body,
                    password,
                    account_created: currentTime,
                    account_updated: currentTime
                }
                // Save it to database
                pool.query('INSERT INTO accounts (id, first_name, last_name, password, username, account_created, account_updated) VALUES ($1,$2,$3,$4,$5,$6,$7)',[newUser.id, newUser.first_name, newUser.last_name, newUser.password, newUser.username, newUser.account_created, newUser.account_updated], (error, results) => {
                    if (error) {
                      return res.sendStatus(400)
                    }
                    delete newUser.password
                    return res.send(newUser)
                  })
            });

        } else {
            return res.sendStatus(400)
        }
};

const updateUserAccountById = (req, res) => {
 const { user } = req;
 const {accountId} = req.params;
 if (user.id != accountId) return res.sendStatus(403)
 if (req.body) {
    pool.query('select * from accounts where id=$1',[accountId], async (error, results) => {
        if (error) {
          return res.sendStatus(400)
        }
    
        let newUser = {}
        if (results.rowCount == 1) {
            newUser = results.rows[0]
            if (req.body.username || req.body.id || req.body.account_created || req.body.account_updated) return res.sendStatus(400); // rejecting update
            if (req.body.password || req.body.first_name || req.body.last_name) {
                if (req.body.password) {
                    newUser.password = await bcrypt.hash(req.body.password, saltRounds);
                }
                if (req.body.first_name) newUser.first_name = req.body.first_name;
                if (req.body.last_name) newUser.last_name = req.body.last_name;
                newUser.account_updated = moment().toISOString();
                //update to database
                pool.query('UPDATE accounts SET password=$1, first_name=$2, last_name=$3, account_updated=$4 WHERE id=$5',[newUser.password, newUser.first_name, newUser.last_name, newUser.account_updated, accountId], (error, results) => {
                    if (error) {
                        return res.sendStatus(400);
                    }
                    return res.sendStatus(204);
                })
            } else {
                return res.sendStatus(400);
            }
        }
      })
 } else {
    return res.sendStatus(400);
 }
};

const init = () => {
    const app = DEF.COM.EXPRESS_APP;
    if (!app) {
        console.error("Express app is not available");
        return;
    }
    app.get("/v1/account/:accountId", authenticate, getUserAccountById);
    app.post("/v1/account", postUserAccountById);
    app.put("/v1/account/:accountId", authenticate, updateUserAccountById);
};

module.exports = {
    init,
}