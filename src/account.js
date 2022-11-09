const { v4: uuid } = require("uuid");
const DEF = require("../definition")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const moment = require("moment-timezone");
const { authenticate } = require("../middleware.js");
const { accounts } = require("../queries");
// create a stdout console logger
const logger = require('simple-node-logger').createSimpleLogger();

const getUserAccountById = (req, res) => {
    const { user } = req;
    const { accountId } = req.params;
    logger.info('getUserAccountById', req.params.accountId)
 if (user.id == accountId) {
    accounts.findOne({ where: { id: accountId } })
            .then((res1) => {
                if(res1 && res1.dataValues) {
                    let result = res1.dataValues
                    delete result.password;
                    return res.send(result)
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error connecting to DB"
                })
            })
 } else {
    return res.sendStatus(403);
 }
};

const postUserAccountById = (req, res) => {
    const { body } = req
        if (body && body.first_name && body.last_name && body.username && body.password) {
            accounts.findOne({ where: { username: body.username } })
            .then(async (res1) => {
                if (res1) return res.status(400).send("User already exists!");
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
                logger.info('Creating new user', newUser.id);
                accounts.create(newUser)
                .then((values) => {
                    if(values && values.dataValues) {
                        let result = values.dataValues
                        delete result.password;
                        return res.send(result)
                    }
                    new Error("Unable to create account")
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error while saving to database"
                    })
                })
            })
            .catch((err1) => {
                res.status(500).send({
                    message: err1.message || "Error while querying from database"
                })
            })

        } else {
            return res.sendStatus(400)
        }
};

const updateUserAccountById = (req, res) => {
 const { user } = req;
 const {accountId} = req.params;
 if (user.id != accountId) return res.sendStatus(403)
 if (req.body) {
    accounts.findOne({ where: { id: accountId }})
    .then(async (res1) => {

        let newUser = {}
        if (res1 && res1.dataValues) {
            newUser = res1.dataValues;
            if (req.body.username || req.body.id || req.body.account_created || req.body.account_updated) return res.sendStatus(400); // rejecting update
            if (req.body.password || req.body.first_name || req.body.last_name) {
                if (req.body.password) {
                    newUser.password = await bcrypt.hash(req.body.password, saltRounds);
                }
                if (req.body.first_name) newUser.first_name = req.body.first_name;
                if (req.body.last_name) newUser.last_name = req.body.last_name;
                newUser.account_updated = moment().toISOString();
                logger.info('updating user', newUser.id)
                accounts.update({
                    password: newUser.password,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    account_updated: newUser.account_updated
                }, {
                    where: { id: accountId }
                })
                .then((result) => {
                    return res.sendStatus(204);
                })
                .catch((error) => {
                    return res.status(500).send({
                        message: error.message || "Error while updating in database"
                    })
                })
            } else {
                return res.sendStatus(400);
            }
        }
      })
      .catch((err1) => {
        res.status(500).send({
            message: err1.message || "Error while querying from database"
        })
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